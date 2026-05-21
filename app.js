const DEMO_MODE = true;

const appState = {
    walletConnected: false,
    walletAddress: null,
    isVerifiedMerchant: false,
    currentBoutique: null,
    currentPage: 'home'
};

// ==========================================
// MODULE WALLET & PERSISTANCE SESSION
// ==========================================
const wallet = {
    saveSession: function() {
        localStorage.setItem('me_tsena_session', JSON.stringify({
            walletConnected: appState.walletConnected,
            walletAddress: appState.walletAddress,
            isVerifiedMerchant: appState.isVerifiedMerchant
        }));
    },

    restoreSession: function() {
        const session = localStorage.getItem('me_tsena_session');
        if (session) {
            const data = JSON.parse(session);
            appState.walletConnected = data.walletConnected || false;
            appState.walletAddress = data.walletAddress || null;
            appState.isVerifiedMerchant = data.isVerifiedMerchant || false;
            ui.updateWalletButton();
        }
    },

    connect: async function() {
        if (window.mePass) {
            try {
                const accounts = await window.mePass.request({ method: 'me_requestAccounts' });
                appState.walletAddress = accounts[0];
                appState.walletConnected = true;
                ui.updateWalletButton();
                this.saveSession();
                router.navigate(appState.currentPage);
                return appState.walletAddress;
            } catch (error) {
                console.error("Erreur d'authentification:", error);
            }
        } else if (DEMO_MODE) {
            appState.walletAddress = "0xME7570146B92C23F6209210B388D6F259728A321";
            appState.walletConnected = true;
            ui.updateWalletButton();
            this.saveSession();
            router.navigate(appState.currentPage);
            return appState.walletAddress;
        }
    },

    disconnect: function() {
        appState.walletConnected = false;
        appState.walletAddress = null;
        appState.isVerifiedMerchant = false;
        appState.currentBoutique = null;
        this.saveSession();
        ui.updateWalletButton();
        router.navigate('home');
    },

    verifyIdentityZK: async function() {
        if (!appState.walletConnected) return false;
        if (DEMO_MODE) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    appState.isVerifiedMerchant = true;
                    this.saveSession();
                    resolve(true);
                }, 1200);
            });
        }
    }
};

// ==========================================
// MODULE COMMERCIAL (MARKETPLACE)
// ==========================================
const marketplace = {
    initialProducts: [
        { 
            id: 1, 
            nom: "Air Jordan 1", 
            description: "Basket mythique style rétro high, édition indémodable.", 
            prix: 2.5, 
            image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80", 
            vendeur: "0xSniperShoes...", 
            boutique: "Sneakers Corner" 
        },
        { 
            id: 2, 
            nom: "Adidas Stan Smith", 
            description: "Les classiques tennis blanches épurées en cuir au style intemporel.", 
            prix: 4, 
            image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", 
            vendeur: "0xSportElite...", 
            boutique: "Trend Homme" 
        },
        { 
            id: 3, 
            nom: "Pack Complet Homme (3 pièces)", 
            description: "Ensemble complet prêt-à-porter : 1 pantalon noir ajusté + 1 tee-shirt classique + 1 jacket tendance.", 
            prix: 4, 
            image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80", 
            vendeur: "0xStylistTana...", 
            boutique: "Trend Homme" 
        }
    ],

    getProducts: function() {
        let current = localStorage.getItem('me_tsena_products');
        if (!current) {
            localStorage.setItem('me_tsena_products', JSON.stringify(this.initialProducts));
            return this.initialProducts;
        }
        return JSON.parse(current);
    },

    getBoutique: function() {
        if (!appState.walletConnected) return null;
        let boutiques = localStorage.getItem('me_tsena_boutiques');
        if (!boutiques) return null;
        return JSON.parse(boutiques)[appState.walletAddress] || null;
    },

    renderSellerZone: function() {
        const zone = document.getElementById('sellerZone');
        if (!zone) return;

        if (!appState.walletConnected) {
            zone.innerHTML = `
                <div class="carte centraliser">
                    <p>Veuillez d'abord connecter votre portefeuille ME Pass pour gérer votre espace de vente.</p>
                    <button class="btn-block" onclick="wallet.connect()">🔑 Connecter mon Wallet</button>
                </div>`;
            return;
        }

        const boutique = this.getBoutique();

        if (!appState.isVerifiedMerchant && !boutique) {
            zone.innerHTML = `
                <div class="carte centraliser">
                    <h3>Fanamarinana ny maha-izy azy / Vérification ZK-DID</h3>
                    <p>Pour lister vos créations sur le marché sans paperasse physique, Meta Earth utilise le protocole de confidentialité <strong>ME ID</strong>.</p>
                    <button class="btn-block" id="verifyIdentityBtn" onclick="marketplace.actionVerifyZK()">🛡️ Hanamafy amin'i ME ID / Confirmer via ME ID</button>
                </div>`;
            return;
        }

        if (appState.isVerifiedMerchant && !boutique) {
            zone.innerHTML = `
                <div class="carte">
                    <div class="badge-verified" style="margin-bottom:12px;">✓ ME ID ZK-Proof Validated</div>
                    <h3>Hamorona fivarotana / Créer votre échoppe</h3>
                    <form id="createBoutiqueForm" onsubmit="marketplace.actionCreateBoutique(event)">
                        <div class="form-group"><label>Anaran'ny Tsena / Nom de votre boutique :</label><input type="text" id="btqName" required></div>
                        <div class="form-group"><label>Mombamomba ny tsena / Description :</label><textarea id="btqDesc" rows="3" required></textarea></div>
                        <button type="submit" class="btn-block">Hanokatra ny tsena / Activer la boutique</button>
                    </form>
                </div>`;
            return;
        }

        if (boutique) {
            appState.currentBoutique = boutique;
            zone.innerHTML = `
                <div class="carte" style="border-left: 5px solid var(--primary);">
                    <div class="badge-verified">✓ Mpivarotra Voamarina / Boutique Certifiée</div>
                    <h3 style="margin-top:8px;">${boutique.nom}</h3>
                    <p>${boutique.description}</p>
                </div>
                <div class="carte">
                    <h3>Hampiditra entana vaovao / Ajouter un produit</h3>
                    <form id="addProductForm" onsubmit="marketplace.actionAddProduct(event)">
                        <div class="form-group"><label>Anaran'ny entana :</label><input type="text" id="pNom" required></div>
                        <div class="form-group"><label>Mombamomba azy :</label><textarea id="pDesc" rows="2" required></textarea></div>
                        <div class="form-group"><label>Lien de l'image (URL) :</label><input type="url" id="pImg" placeholder="https://exemple.com/image.jpg"></div>
                        <div class="form-group"><label>Bidim-piainana (MEC) :</label><input type="number" id="pPrix" step="0.1" min="0.1" required></div>
                        <button type="submit" class="btn-block">Hampiditra amin'ny tsena / Publier</button>
                    </form>
                </div>`;
        }
    },

    actionVerifyZK: async function() {
        const btn = document.getElementById('verifyIdentityBtn');
        btn.innerText = "Fikajiana ny preuve...";
        btn.disabled = true;
        if (await wallet.verifyIdentityZK()) this.renderSellerZone();
    },

    actionCreateBoutique: function(e) {
        e.preventDefault();
        let boutiques = JSON.parse(localStorage.getItem('me_tsena_boutiques') || '{}');
        boutiques[appState.walletAddress] = {
            nom: document.getElementById('btqName').value,
            description: document.getElementById('btqDesc').value,
            active: true
        };
        localStorage.setItem('me_tsena_boutiques', JSON.stringify(boutiques));
        this.renderSellerZone();
    },

    actionAddProduct: function(e) {
        e.preventDefault();
        let products = this.getProducts();
        const imgInput = document.getElementById('pImg').value;
        const defaultImg = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80"; // Image cosmétique/beauté neutre par défaut
        
        products.push({
            id: products.length + 1,
            nom: document.getElementById('pNom').value,
            description: document.getElementById('pDesc').value,
            prix: parseFloat(document.getElementById('pPrix').value),
            image: imgInput || defaultImg,
            vendeur: appState.walletAddress,
            boutique: this.getBoutique().nom
        });
        localStorage.setItem('me_tsena_products', JSON.stringify(products));
        alert("Tafiditra soa aman-tsara ! Produit publié.");
        this.renderSellerZone();
    },

    renderCatalog: function(itemsToRender = null) {
        const grid = document.getElementById('catalogGrid');
        if (!grid) return;
        const products = itemsToRender || this.getProducts();
        grid.innerHTML = products.length === 0 ? `<p style="grid-column: span 2; text-align: center;">Tsy misy entana.</p>` : "";
        products.forEach(prod => {
            const card = document.createElement('div');
            card.className = "produit-card";
            card.innerHTML = `
                <img src="${prod.image}" class="produit-img" alt="${prod.nom}" onerror="this.src='https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80'">
                <div class="produit-info">
                    <span style="font-size:0.65rem; color:var(--primary); font-weight:700;">${prod.boutique}</span>
                    <div class="produit-nom">${prod.nom}</div>
                    <div class="produit-prix">${prod.prix} MEC</div>
                    <button class="produit-btn" onclick="payment.initiatePurchase(${prod.id}, ${prod.prix}, '${prod.nom.replace(/'/g, "\\'")}')">🗳️ Hividy / Acheter</button>
                </div>`;
            grid.appendChild(card);
        });
    },

    filterProducts: function(keyword) {
        this.renderCatalog(this.getProducts().filter(p => p.nom.toLowerCase().includes(keyword.toLowerCase())));
    }
};

// ==========================================
// MODULE DE PAIEMENT
// ==========================================
const payment = {
    initiatePurchase: function(productId, prix, productNom) {
        if (!appState.walletConnected) { alert("Mila mampandray an'i ME Pass aloha ianao."); return; }
        ui.showModal("Fandoavam-bola / Règlement QR Code", `
            <div class="centraliser">
                <p>Scaner-o amin'ny alalan'ny <strong>ME Pass 3.0</strong></p>
                <div style="background: white; border: 4px solid var(--primary); padding: 16px; display: inline-block; border-radius: 12px; margin: 15px 0;">
                    <div style="width: 140px; height: 140px; background: #1a202c; display:flex; align-items:center; justify-content:center; color:white; font-size:1.8rem; border-radius:8px;">📱</div>
                </div>
                <p><strong>${productNom}</strong></p>
                <p style="color:var(--primary); font-weight:800; font-size:1.2rem;">${prix} MEC</p>
                <button class="btn-block" id="confirmPayBtn" onclick="payment.actionSimulateBlockchainPayment(${productId}, ${prix})">✓ Efa voaloha / Confirmer</button>
            </div>`);
    },

    actionSimulateBlockchainPayment: function(productId, prix) {
        const btn = document.getElementById('confirmPayBtn');
        btn.innerText = "Validation on-chain...";
        btn.disabled = true;

        setTimeout(() => {
            let products = marketplace.getProducts().filter(p => p.id !== productId);
            const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
            const nftReceiptId = Math.floor(Math.random() * 8999) + 1000;

            let historique = JSON.parse(localStorage.getItem('me_tsena_historique') || '[]');
            historique.unshift({ 
                nftId: nftReceiptId, 
                txHash: txHash, 
                productId: productId, 
                prix: prix, 
                date: new Date().toLocaleDateString('fr-FR'), 
                acheteur: appState.walletAddress 
            });
            localStorage.setItem('me_tsena_historique', JSON.stringify(historique));
            localStorage.setItem('me_tsena_products', JSON.stringify(products));

            ui.showModal("Règlement Réussi", `
                <div class="centraliser">
                    <h3 style="color:var(--success);">Tafita soa aman-tsara !</h3>
                    <div class="carte" style="text-align:left; font-size:0.8rem; background:var(--primary-light);">
                        <div><strong>Kanto NFT Reçu :</strong> #${nftReceiptId}</div>
                        <div style="word-break:break-all;"><strong>TX :</strong> ${txHash}</div>
                    </div>
                    <button class="btn-block" onclick="ui.closeModal(); router.navigate('catalog');">Miverina / Retour</button>
                </div>`);
        }, 1500);
    }
};

// ==========================================
// ROUTAGE ET INITIALISATION
// ==========================================
const router = {
    pages: {
        home: `
            <div class="page text-center">
                <div class="carte centraliser" style="background: linear-gradient(135deg, #1D9E75, #157456); color: white; padding: 25px 16px;">
                    <h2 style="color: white; font-size: 1.5rem; margin-bottom: 4px;">ME Tsena</h2>
                    <p style="color: #e8f5f1; font-size: 0.85rem;">Tsenanao amin'ny Web3 / Votre marché décentralisé</p>
                </div>
                <div class="carte">
                    <h3>Fandraisana / Bienvenue</h3>
                    <p>Accédez au marché sans paperasse administrative grâce à l'identité cryptographique souveraine Meta Earth ZK-DID.</p>
                </div>
                <div id="homeActionZone"><button class="btn-block" onclick="wallet.connect()">🔑 Connecter ME Pass</button></div>
            </div>`,
        catalog: `
            <div class="page">
                <input type="text" class="search-bar" placeholder="Fikarohana / Rechercher un produit..." oninput="marketplace.filterProducts(this.value)">
                <h2>Hividy / Catalogue</h2>
                <div id="catalogGrid" class="grille-produits"></div>
            </div>`,
        seller: `
            <div class="page"><div id="sellerZone"></div></div>`
    },

    navigate: function(pageId) {
        appState.currentPage = pageId;
        const appContent = document.getElementById('appContent');
        if (this.pages[pageId]) {
            appContent.innerHTML = this.pages[pageId];
            this.updateActiveTab(pageId);
            if (pageId === 'home') this.initHomePage();
            if (pageId === 'catalog') marketplace.renderCatalog();
            if (pageId === 'seller') marketplace.renderSellerZone();
        }
    },

    updateActiveTab: function(pageId) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById('nav' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
        if (activeBtn) activeBtn.classList.add('active');
    },

    initHomePage: function() {
        const zone = document.getElementById('homeActionZone');
        if (zone && appState.walletConnected) {
            zone.innerHTML = `
                <div class="carte centraliser">
                    <p style="color:var(--success); font-weight:700;">✓ Portefeuille connecté</p>
                    <button class="btn-block" onclick="router.navigate('catalog')">🛍️ Hijery Tsena / Visiter</button>
                </div>`;
        }
    }
};

const ui = {
    showModal: function(title, html) {
        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('globalModal').classList.remove('hidden');
    },
    closeModal: function() { document.getElementById('globalModal').classList.add('hidden'); },
    updateWalletButton: function() {
        const btn = document.getElementById('walletBtn');
        const txt = document.getElementById('walletStatusText');
        if (appState.walletConnected) {
            btn.classList.add('connected');
            txt.innerText = appState.walletAddress.substring(0, 6) + '...' + appState.walletAddress.slice(-4);
        } else {
            btn.classList.remove('connected');
            txt.innerText = "Hifandray / Connexion";
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    wallet.restoreSession();
    router.navigate('home');

    document.getElementById('walletBtn').addEventListener('click', () => {
        if (!appState.walletConnected) wallet.connect();
        else wallet.disconnect();
    });

    window.addEventListener('popstate', () => { 
        router.navigate('home'); 
    });

    document.getElementById('globalModal').addEventListener('click', function(e) { 
        if (e.target === this) ui.closeModal(); 
    });
});
