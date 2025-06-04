// script.js
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      const result = await response.json();
      if (response.ok) {
        // Store the token and its expiration time in localStorage
        localStorage.setItem("authToken", result.token);
        // Set token expiration to 24 hours from now
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiration", expirationTime);
        window.location.href = "index.html";
      } else {
        await Swal.fire({
          icon: "error",
          title: "خطأ في تسجيل الدخول",
          text: "اسم المستخدم أو كلمة المرور غير صحيحة",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى",
      });
    }
  });
