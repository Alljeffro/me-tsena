// Adresses des contrats après exécution de deploy.js
const CONTRACT_ADDRESSES = {
    MECToken: "0x...", // Mettre l'adresse générée par Hardhat
    MallBoutique: "0x..." 
};

let currentSigner = null;
let currentLanguage = 'fr';

// Dictionnaires de traduction pour le contenu dynamique
const translations = {
    fr: { connected: "MePass Connecté", minting: "Création de la boutique...", success: "Succès !" },
    en: { connected: "MePass Connected", minting: "Minting your shop...", success: "Success!" },
    mg: { connected: "Tafandray ny MePass", minting: "Amboarina ny tsena...", success: "Tontosa !" }
};

// 1. Gestion de l'identité & Accès via ME Pass (Meta Earth Auth Simulation)
async function connectMEPass() {
    if (!window.ethereum) {
        alert("Veuillez utiliser le navigateur de votre ME Wallet ou MetaMask sur Android.");
        return;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Demande de bascule sur le réseau ME Network RollApp
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xd6' }], // 214 en hexadécimal
            });
        } catch (switchError) {
            // Si le réseau n'est pas configuré dans le wallet, on l'ajoute
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xd6',
                        chainName: 'ME Network 2.0 RollApp',
                        rpcUrls: ['https://rpc.mechain.io'],
                        nativeCurrency: { name: 'MEC', symbol: 'MEC', decimals: 18 }
                    }]
                });
            }
        }

        const accounts = await provider.send("eth_requestAccounts", []);
        currentSigner = await provider.getSigner();
        
        // Mettre à jour l'interface utilisateur
        document.getElementById("userId").innerText = accounts[0];
        document.getElementById("connectBtn").innerText = translations[currentLanguage].connected;
        document.getElementById("loginPrompt").classList.add("hidden");
        document.getElementById("mepassProfile").classList.remove("hidden");
        document.getElementById("mallSection").classList.remove("hidden");
        
        loadUserBalance(accounts[0]);
    } catch (error) {
        console.error("Erreur d'authentification ME Pass:", error);
    }
}

async function loadUserBalance(address) {
    // Appel RPC pour récupérer le solde de MEC Token (ERC20)
    // Code d'interaction d'appel de balance standard
}

// 2. Gestion Inter-langues en Temps Réel
function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Traduction des titres
    document.querySelectorAll(".lang-title").forEach(el => {
        el.innerText = el.getAttribute(`data-${lang}`);
    });
    
    // Traduction des paragraphes et boutons
    document.querySelectorAll(".lang-text").forEach(el => {
        el.innerText = el.getAttribute(`data-${lang}`);
    });
}

// 3. Logique des Boutiques & Marchands (Phase 2)
async function mintShop() {
    if (!currentSigner) return;
    console.log(translations[currentLanguage].minting);
    
    // Interaction avec le contrat ERC-721 MallBoutique
    // const boutiqueContract = new ethers.Contract(CONTRACT_ADDRESSES.MallBoutique, ABI, currentSigner);
    // let tx = await boutiqueContract.mintBoutique(...);
}

function switchTab(tab) {
    if (tab === 'buyer') {
        document.getElementById("buyerTab").classList.remove("hidden");
        document.getElementById("sellerTab").classList.add("hidden");
    } else {
        document.getElementById("buyerTab").classList.add("hidden");
        document.getElementById("sellerTab").classList.remove("hidden");
    }
}
