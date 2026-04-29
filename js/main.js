  /* ── Validação de idade ── */
    function validarIdade() {
      const idade = parseInt(document.getElementById("idade").value, 10);
      if (isNaN(idade) || idade < 10 || idade > 100) {
        alert("Idade deve estar entre 10 e 100 anos!");
        return false;
      }
      return true;
    }

    /* ── Toggle dark/light mode ── */
    const btn = document.getElementById("theme-toggle");
    const html = document.documentElement;

    // Lê preferência salva ou usa preferência do sistema
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = saved || (prefersDark ? "dark" : "light");
    html.setAttribute("data-theme", initialTheme);

    btn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });