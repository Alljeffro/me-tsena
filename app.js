// Dictionnaire de traduction trilingue pour Me Tsena
const translations = {
  fr: {
    mepass_title: "Carte d'identité Web3 Passeport",
    level: "Niveau ME Pass",
    member_since: "Membre depuis",
    status_buyer: "Acheteur",
    send: "Envoyer",
    receive: "Recevoir",
    stake: "Staker",
    enter_mall: "Entrer dans le centre commercial ↗",
    mall_title: "Boutiques connectées",
    open_shop: "Ouvrir ma boutique ↗"
  },
  en: {
    mepass_title: "Web3 Passport Identity",
    level: "ME Pass Level",
    member_since: "Member Since",
    status_buyer: "Buyer",
    send: "Send",
    receive: "Receive",
    stake: "Stake",
    enter_mall: "Enter the Shopping Mall ↗",
    mall_title: "Connected Shops",
    open_shop: "Open my shop ↗"
  },
  mg: {
    mepass_title: "Karapanondro Web3 MePass",
    level: "Haavo ME Pass",
    member_since: "Mpikambana nanomboka",
    status_buyer: "Mpiantsena",
    send: "Handefa",
    receive: "Handray",
    stake: "Staker",
    enter_mall: "Hiditra ao an-tsena ↗",
    mall_title: "Ireo Tsena misy",
    open_shop: "Hiforona tsena vaovao ↗"
  }
};

// Fonction de gestion de la navigation entre écrans
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');

  // Mise à jour graphique de la barre de navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if(screenId === 'screen-mepass') document.getElementById('nav-mepass').classList.add('active');
  if(screenId === 'screen-mall') document.getElementById('nav-mall').classList.add('active');
}

// Fonction de basculement linguistique dynamique
function changeLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (element.tagName === 'INPUT') {
        element.placeholder = translations[lang][key];
      } else {
        element.innerText = translations[lang][key];
      }
    }
  });
}

// Initialisation au chargement de l'application
document.addEventListener("DOMContentLoaded", () => {
  changeLanguage('fr');
});
