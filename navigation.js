// navigation.js

// -------------------------------------------------------------------
// Firebase SDK import 및 초기화
// -------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc,
    getDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7mA9xLOFb98i5hKNWjKW_fORWNHvPx2s",
    authDomain: "sik-jip-sa.firebaseapp.com",
    projectId: "sik-jip-sa",
    storageBucket: "sik-jip-sa.appspot.com",
    messagingSenderId: "401707534850",
    appId: "1:401707534850:web:e15b2f67e2d4484a07351b",
    measurementId: "G-HX50P6C0NT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ▼▼▼ [수정] const 앞에 export를 추가하고, storage를 생성합니다. ▼▼▼
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// 아래 함수들도 export
export { ref, uploadBytes, getDownloadURL };
// 스크롤에 반응하는 헤더 스타일 변경

window.addEventListener('scroll', () => {
    // window.scrollY 값이 50px보다 크면 'scrolled' 클래스 추가
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


// -------------------------------------------------------------------
// DOM 요소 선택
// -------------------------------------------------------------------
const header = document.getElementById('main-header');
const modalWrapper = document.getElementById('modal-wrapper');
const loginNavButton = document.querySelector('header nav .cta-button');
const closeButton = document.querySelector('.close-button');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginFormElement = loginForm.querySelector('form');
const signupFormElement = signupForm.querySelector('form');

const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const modalRight = document.querySelector('.modal-right');


// 모달 열기 함수
const openLoginModal = (event) => {
    event.preventDefault();
    modalWrapper.classList.add('open');
};

// 모달 닫기 함수
const closeModal = () => {
    modalWrapper.classList.remove('open');
};

// 폼 전환 함수 (로그인/회원가입)
const switchForms = (hideForm, showForm) => {
    modalRight.style.opacity = '0';
    setTimeout(() => {
        hideForm.style.display = 'none';
        showForm.style.display = 'block';
        modalRight.style.opacity = '1';
    }, 300);
};

// 모달 관련 이벤트 리스너
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === modalWrapper) closeModal();
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalWrapper.classList.contains('open')) closeModal();
});
showSignupLink.addEventListener('click', (event) => {
    event.preventDefault();
    switchForms(loginForm, signupForm);
});
showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    switchForms(signupForm, loginForm);
});

// .modal-right에 transition 효과 추가 (스타일 주입)
const style = document.createElement('style');
style.innerHTML = `.modal-right { transition: opacity 0.3s ease-in-out; }`;
document.head.appendChild(style);


// -------------------------------------------------------------------
// Firebase Form 제출 로직 (로그인/회원가입)
// -------------------------------------------------------------------

// 1. 회원가입 폼 제출
signupFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            createdAt: serverTimestamp()
        });
        alert('🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        switchForms(signupForm, loginForm);
    } catch (error) {
        console.error("❌ 회원가입 에러:", error);
        if (error.code === 'auth/email-already-in-use') alert('이미 사용 중인 이메일입니다.');
        else if (error.code === 'auth/weak-password') alert('비밀번호는 6자 이상이어야 합니다.');
        else alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
    }
});

// 2. 로그인 폼 제출 (⭐ 새로 추가된 부분)
loginFormElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // 로그인이 성공하면 onAuthStateChanged가 감지하여 UI를 변경하고 모달을 닫습니다.
        closeModal();
    } catch (error) {
        console.error("❌ 로그인 에러:", error);
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
});


// -------------------------------------------------------------------
// 🚀 Firebase 인증 상태 변경 리스너 (⭐ 핵심 로직)
// -------------------------------------------------------------------

let isLogoutListenerAttached = false;

// 로그아웃 핸들러
const handleLogout = async () => {
    try {
        await signOut(auth);
        alert('로그아웃 되었습니다.');
    } catch (error) {
        console.error('로그아웃 에러', error);
        alert('로그아웃 중 문제가 발생했습니다.');
    }
};

onAuthStateChanged(auth, async (user) => {
    // 이전에 추가된 로그아웃 리스너가 있다면 제거
    if (isLogoutListenerAttached) {
        loginNavButton.removeEventListener('click', handleLogout);
        isLogoutListenerAttached = false;
    }
    
    // 이전에 추가된 모달 열기 리스너가 있다면 제거
    loginNavButton.removeEventListener('click', openLoginModal);

    if (user) {
        // --- 👤 사용자가 로그인한 경우 ---
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userName = userDoc.data().name;
            loginNavButton.textContent = `${userName} 초록이`;
            // 이제 이 버튼은 로그아웃 기능을 합니다.
            loginNavButton.addEventListener('click', handleLogout);
            isLogoutListenerAttached = true;
        } else {
            // Firestore에 데이터가 없는 경우 (오류 상황)
            loginNavButton.textContent = '정보 없음';
        }
    } else {
        // --- 🚪 사용자가 로그아웃한 경우 ---
        loginNavButton.textContent = 'Login';
        // 이제 이 버튼은 로그인 모달을 엽니다.
        loginNavButton.addEventListener('click', openLoginModal);
    }
});

