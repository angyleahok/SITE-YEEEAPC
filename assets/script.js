/* ==========================================================
   Yeee — petits réglages du site
   ----------------------------------------------------------
   Les 2 seules lignes à remplir plus tard :
   ========================================================== */

// 1) Votre adresse e-mail de contact (affichée sur le site).
var EMAIL_CONTACT = "";        // ex. : "contact@exemple.fr"

// 2) La clé Web3Forms reçue par e-mail (ce n'est PAS un mot de passe :
//    elle peut être publique, elle sert seulement à vous envoyer les demandes).
var CLE_WEB3FORMS = "";        // ex. : "a1b2c3d4-...."

/* ---------- Ne rien modifier en dessous ---------- */

(function () {
  "use strict";

  // Menu sur téléphone
  var bouton = document.querySelector(".bouton-menu");
  var menu = document.getElementById("menu");
  if (bouton && menu) {
    bouton.addEventListener("click", function () {
      var ouvert = menu.classList.toggle("ouvert");
      bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  // Année dans le pied de page
  document.querySelectorAll("[data-annee]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Adresse e-mail : remplace les [À COMPLÉTER] quand l'adresse est renseignée
  var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(EMAIL_CONTACT);
  if (emailOk) {
    document.querySelectorAll("[data-email-texte]").forEach(function (el) {
      el.textContent = EMAIL_CONTACT;
      el.classList.remove("a-completer");
    });
  }
  document.querySelectorAll("[data-email-lien]").forEach(function (lien) {
    if (emailOk) {
      var sujet = lien.getAttribute("data-sujet") || "Demande de devis - Yeee";
      lien.href = "mailto:" + EMAIL_CONTACT + "?subject=" + encodeURIComponent(sujet);
    } else {
      lien.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Adresse e-mail pas encore renseignée [À COMPLÉTER].");
      });
    }
  });

  // Formulaire de devis
  var form = document.getElementById("form-devis");
  if (!form) return;

  var zoneMessage = document.getElementById("message-envoi");
  var boutonEnvoi = form.querySelector("button[type=submit]");

  // Pas de date passée
  var champDate = form.querySelector("#date");
  if (champDate) {
    champDate.min = new Date().toISOString().slice(0, 10);
  }

  function afficher(type, texte) {
    zoneMessage.className = "message-envoi " + type;
    zoneMessage.textContent = texte;
    zoneMessage.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!CLE_WEB3FORMS) {
      afficher("erreur", "Le formulaire n'est pas encore relié à la boîte e-mail [À COMPLÉTER : clé Web3Forms]. Rien n'a été envoyé.");
      return;
    }

    var donnees = new FormData(form);
    donnees.append("access_key", CLE_WEB3FORMS);
    donnees.append("subject", "Nouvelle demande de devis - " + (donnees.get("entreprise") || "site Yeee"));
    donnees.append("from_name", "Site Yeee");

    boutonEnvoi.disabled = true;
    boutonEnvoi.textContent = "Envoi en cours…";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: donnees
    })
      .then(function (r) { return r.json(); })
      .then(function (rep) {
        if (rep && rep.success) {
          form.reset();
          afficher("ok", "Merci ! Votre demande est bien partie. Nous revenons vers vous très vite.");
        } else {
          throw new Error("refus");
        }
      })
      .catch(function () {
        afficher("erreur", "Oups, l'envoi n'a pas fonctionné. Réessayez dans un instant, ou écrivez-nous directement par e-mail.");
      })
      .then(function () {
        boutonEnvoi.disabled = false;
        boutonEnvoi.textContent = "Envoyer ma demande";
      });
  });
})();
