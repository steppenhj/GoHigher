async function waitForLenis(callback) {
    if (!window.Lenis) {
      try {
        const module = await import("https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.28/dist/lenis.min.js");
        window.Lenis = module.default;
      } catch (error) {
        console.error("❌ Lenis.js 로드 실패:", error);
        return;
      }
    }
  
    console.log("✅ Lenis.js가 정상적으로 로드됨.");
    callback();
  }
  
  window.addEventListener("load", () => {
    waitForLenis(() => {
      const lenis = new window.Lenis({
        lerp: 0.1,
        smooth: true,
      });
  
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
  
      console.log("✅ Lenis.js 초기화 완료.");
    });
  
    if (document.querySelector("[data-barba='wrapper']")) {
      barba.init({
        transitions: [
          {
            name: "fade",
            leave(data) {
              return gsap.to(data.current.container, { opacity: 0, duration: 0.5 });
            },
            enter(data) {
              return gsap.from(data.next.container, { opacity: 0, duration: 0.5 });
            },
          },
        ],
        views: [
          {
            namespace: "default",
            afterEnter(data) {
              console.log("✅ Barba.js 페이지 전환 완료. Lenis.js 다시 실행.");
              waitForLenis(() => {
                const lenis = new window.Lenis({
                  lerp: 0.1,
                  smooth: true,
                });
  
                function raf(time) {
                  lenis.raf(time);
                  requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
              });
            },
          },
        ],
      });
      console.log("✅ Barba.js 정상 적용됨.");
    } else {
      console.error("❌ Barba.js 적용 실패. data-barba='wrapper'가 존재하지 않음.");
    }
  });
  