let tanksCountTeam1 = 0;
let dpsCountTeam1 = 0;
let supportCountTeam1 = 0;
let tanksCountTeam2 = 0;
let dpsCountTeam2 = 0;
let supportCountTeam2 = 0;
let selectedHeroes = {};
let allScores;
let isRequestPendingAlly = false;
let isRequestPendingEnemies = false;
let championsQueueAlly = [];
let championRemoveQueueAlly = [];
let championsQueueOpponent = [];
let championRemoveQueueOpponent = [];



document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementById('menuButton');
    const menuList = document.getElementById('menuList');
    const openModal = document.getElementById('openModal');
    const modal = document.getElementById('myModal');
    const closeModal = document.getElementsByClassName('close')[0];

    // Fonction pour basculer l'affichage du menu
    function toggleMenu() {
        const isMenuVisible = menuList.style.display === 'block';
        menuList.style.display = isMenuVisible ? 'none' : 'block';
        menuButton.classList.toggle('active', !isMenuVisible);
    }

    // Ajouter un événement de clic sur le bouton de menu
    menuButton.addEventListener('click', function (event) {
        event.stopPropagation(); // Empêche le clic de se propager au document
        toggleMenu();
    });

    // Ajouter un événement de clic sur le document pour fermer le menu
    document.addEventListener('click', function (event) {
        const isClickInsideMenu = menuButton.contains(event.target) || menuList.contains(event.target);
        if (!isClickInsideMenu) {
            menuList.style.display = 'none';
            menuButton.classList.remove('active');
        }
    });

    // Ouvrir la modale lorsque "Source" est cliqué
    openModal.addEventListener('click', function (event) {
        event.preventDefault();
        modal.style.display = 'block';
    });

    // Fermer la modale lorsqu'on clique sur le bouton de fermeture
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Fermer la modale lorsqu'on clique en dehors du contenu de la modale
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });


});


function resetImages() {
    const fixedImages = document.querySelectorAll('.fixed-image');
    for (let image of fixedImages) {
        image.classList.remove('grayscale');
        tanksCountTeam2 = 0;
        dpsCountTeam2 = 0;
        supportCountTeam2 = 0;
        tanksCountTeam1 = 0;
        dpsCountTeam1 = 0;
        supportCountTeam1 = 0;
    }

    const blocks = document.querySelectorAll('.block');
    for (let block of blocks) {
        block.innerHTML = '';
    }
    grayImageCountTanks = 0;
    grayImageCountDps = 0;
    grayImageCountSupports = 0;
    selectedHeroes = {};
    resetChampions();
    document.getElementById('cbx').checked = true;
    document.getElementById('cbxBlue').checked = false;
    document.getElementById('cbxGreen').checked = false;

}

var basePath = "{{ url_for('static', filename='Heroes/') }}";

document.addEventListener("DOMContentLoaded", function () {
    // Effectuez une requête POST vers /reset_champions dès le chargement de la page
    attachEventListeners();
    resetChampions();
    document.getElementById('cbx').checked = true;
    document.getElementById('cbx').addEventListener('change', function () {
        document.getElementById('cbxBlue').checked = false;
        document.getElementById('cbxGreen').checked = false;
        //toggleScoresVisibility(this.checked);
        updateHeroContainers(allScores);
    });
    document.getElementById('cbxBlue').addEventListener('change', function () {
        document.getElementById('cbx').checked = false;
        document.getElementById('cbxGreen').checked = false;
        updateHeroContainers(allScores);

    });
    document.getElementById('cbxGreen').addEventListener('change', function () {
        document.getElementById('cbx').checked = false;
        document.getElementById('cbxBlue').checked = false;
        updateHeroContainers(allScores);
    });
    document.getElementById('cbxGreen').addEventListener('change', function () {
        if (document.getElementById('cbxBlue').checked == false & document.getElementById('cbxGreen').checked == false) {
            document.getElementById('cbx').checked = true;
            updateHeroContainers(allScores);
        }
    });
    document.getElementById('cbxBlue').addEventListener('change', function () {
        if (document.getElementById('cbxBlue').checked == false & document.getElementById('cbxGreen').checked == false) {
            document.getElementById('cbx').checked = true;
            updateHeroContainers(allScores);
        }
    });
});

function attachEventListeners() {
    document.querySelectorAll('.fixed-image').forEach(function (element) {
        element.addEventListener('click', function () { moveImage(this); });
    });
}


function scoreToColor(score) {
    const red = Math.round(255 * (1 - score));
    const green = Math.round(255 * score);
    const blue = 0;
    return `rgb(${red},${green},${blue})`;
}


function resetChampions() {
    $.ajax({        
        type: "POST",
        url: `reset_champions`,  // Endpoint Flask où envoyer les données
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name="csrf-token"]').attr('content'));
        },
        success: function (response) {
            //console.log("Server response:", response);
            updateHeroContainers(response);
            // Gérer la réponse du serveur ici (si nécessaire)
        },
        error: function (error) {
            console.error("Champion limit reached for this type or team.", error);
        }
    });

}
function processQueueAlly() {

    // Vérifie s'il y a des éléments dans la queue et qu'aucune requête est en cours
    if (championsQueueAlly.length > 0 && !isRequestPendingAlly) {
        const championName = championsQueueAlly.shift(); // Obtient et enlève le premier élément de la queue
        sendChampionRequest(championName);
    }
}

function sendChampionRequest(championName) {
    isRequestPendingAlly = true; // Marque le début d'une requête

    // Ici, on envoie la requête au serveur
    $.ajax({
        type: "POST",
        url: "ally_champion",
        data: { ally_champion: championName },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name="csrf-token"]').attr('content'));
        },
        success: function (response) {
            //console.log("Server response:", response);
            updateHeroContainers(response);
            isRequestPendingAlly = false; // Marque la fin de la requête
            processQueueAlly(); // Vérifie et traite les éléments restants dans la queue
        },
        error: function (error) {
            console.error("Champion limit reached for this type or team.", error);
            isRequestPendingAlly = false; // Assure la continuation même en cas d'erreur
            processQueueAlly(); // Continue avec le prochain élément de la queue
        }
    });
}

function selectHeroAlly(championName) {
    if (isRequestPendingEnemies) {
        // console.log('Wait!! processQueueAlly');
        setTimeout(() => selectHeroAlly(championName), 500); // Réessaye après un délai
    } else {
        console.log(championName);
        championsQueueAlly.push(championName); // Ajoute le champion à la queue
        processQueueAlly();
    }
}

function processQueueOpponent() {

    // Vérifie s'il y a des éléments dans la queue et qu'aucune requête est en cours
    if (championsQueueOpponent.length > 0 && !isRequestPendingEnemies) {
        const championName = championsQueueOpponent.shift(); // Obtient et enlève le premier élément de la queue
        sendChampionRequestOpponent(championName);
    }
}

function selectHeroOpponent(championName) {

    if (isRequestPendingAlly) {
        // console.log('Wait!! processQueueAlly');
        setTimeout(() => selectHeroOpponent(championName), 500); // Réessaye après un délai
    } else {
        console.log(championName);
        championsQueueOpponent.push(championName); // Ajoute le champion à la queue
        processQueueOpponent();
    }
}


function sendChampionRequestOpponent(championName) {
    isRequestPendingEnemies = true; // Marque le début d'une requête

    $.ajax({
        type: "POST",
        url: `opponent_champion`,  // Endpoint Flask où envoyer les données
        data: { opponent_champion: championName },  // Données à envoyer
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name="csrf-token"]').attr('content'));
        },
        success: function (response) {
            console.log("Server response: ", response);
            updateHeroContainers(response);
            isRequestPendingEnemies = false; // Marque la fin de la requête
            processQueueOpponent();
        },
        error: function (error) {
            console.error("Champion limit reached for this type or team.", error);
            isRequestPendingEnemies = false; // Assure la continuation même en cas d'erreur
            processQueueOpponent();
        }
    });
}

function removeHeroAlly(championName) {
    if (isRequestPendingEnemies) {
        // console.log('Wait!! processQueueAlly');
        setTimeout(() => removeHeroAlly(championName), 500); // Réessaye après un délai
    } else {
        console.log(championName);
        championRemoveQueueAlly.push(championName); // Ajoute le champion à la queue
        processRemoveQueue();
    }
}

function processRemoveQueue() {
    if (!isRequestPendingAlly && championRemoveQueueAlly.length > 0) {
        const championNameToRemove = championRemoveQueueAlly.shift();
        isRequestPendingAlly = true;

        $.ajax({
            type: "POST",
            url: "remove_ally_champion",
            data: { ally_champion: championNameToRemove },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', $('meta[name="csrf-token"]').attr('content'));
            },
            success: function (response) {
                updateHeroContainers(response);
                isRequestPendingAlly = false;
                if (championRemoveQueueAlly.length > 0) {
                    processRemoveQueue(); // Traite le prochain élément dans la queue
                }
            },
            error: function (error) {
                console.error("Error removing champion: ", error);
                isRequestPendingAlly = false;
                if (championRemoveQueueAlly.length > 0) {
                    processRemoveQueue(); // Essaie à nouveau ou passe au prochain
                }
            }
        });
    }
}

function removeHeroOpponent(championName) {
    if (isRequestPendingAlly) {
        // console.log('Wait!! processQueueAlly');
        setTimeout(() => removeHeroOpponent(championName), 500); // Réessaye après un délai
    } else {
        console.log(championName);
        championRemoveQueueOpponent.push(championName); // Ajoute le champion à la queue
        processRemoveQueueOpponent();
    }
}

function processRemoveQueueOpponent() {
    if (!isRequestPendingEnemies && championRemoveQueueOpponent.length > 0) {
        const championNameToRemove = championRemoveQueueOpponent.shift();
        isRequestPendingEnemies = true;

        $.ajax({
            type: "POST",
            url: "remove_opponent_champion",
            data: { opponent_champion: championNameToRemove },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', $('meta[name="csrf-token"]').attr('content'));
            },
            success: function (response) {
                updateHeroContainers(response);
                isRequestPendingEnemies = false;
                if (championRemoveQueueOpponent.length > 0) {
                    processRemoveQueueOpponent(); // Traite le prochain élément dans la queue
                }
            },
            error: function (error) {
                console.error("Error removing champion: ", error);
                isRequestPendingEnemies = false;
                if (championRemoveQueueOpponent.length > 0) {
                    processRemoveQueueOpponent(); // Essaie à nouveau ou passe au prochain
                }
            }
        });
    }
}

function getScores(heroName, scoreType, data) {
    const categories = ['dps', 'healers', 'tanks'];
    for (const category of categories) {
        const foundHero = data[scoreType][category].find(hero => hero[0] === heroName);
        if (foundHero) {
            return foundHero[1];
        }
    }
    return null;
}

function updateHeroContainers(data) {
    //console.log("data: ", data)
    //console.log("selectedHeroes: ", selectedHeroes)

    //calsuler les score totaux
    let totalSynergyScore = 0;
    let totalOpponentScore = 0;

    allScores = data
    const isMergeEnabled = document.getElementById('cbx').checked;
    const cbxBlue = document.getElementById('cbxBlue').checked;
    ['tanks', 'dps', 'healers'].forEach(category => {
        const container = document.querySelector(`.category-container.${category}`);
        if (!container) {
            console.warn(`No container found for category: ${category}`);
            return;
        }
        container.innerHTML = '';

        const heroes = data.opponent?.[category] ?? []; // Utiliser coalescence nulle et valeur par défaut []
        const synergyScores = data.synergy?.[category] ?? [];
        const maxScore = Math.max(...heroes.map(hero => hero[1]));
        const minScore = Math.min(...heroes.map(hero => hero[1]));

        // Calculer le score combiné pour chaque héros
        const heroData = heroes.map(heroTuple => {
            const [heroName, score] = heroTuple;
            // On cherche le héro dans synergyScores et on récupère son score pour ensuite le fusionner avec le score opponent
            const synergyScore = synergyScores.find(s => s[0] === heroName)?.[1] || 0;
            const combinedScore = isMergeEnabled ? (score + synergyScore).toFixed(2) : score;
            return { heroName, score, synergyScore, combinedScore };
        });

        // Trier les héros en fonction de la condition
        if (cbxBlue) {
            heroData.sort((a, b) => b.synergyScore - a.synergyScore);
        } else if (isMergeEnabled) {
            heroData.sort((a, b) => b.combinedScore - a.combinedScore);
        } else {
            heroData.sort((a, b) => b.score - a.score);
        }

        heroData.forEach(({ heroName, score, synergyScore, combinedScore }) => {
            combinedScore = parseFloat(combinedScore);
            const normalizedScore = (score - minScore) / (maxScore - minScore);
            const color = scoreToColor(normalizedScore);
            const heroDiv = isMergeEnabled ?
                createHeroDiv(heroName, category, combinedScore, 0, combinedScore, isMergeEnabled, color) : // Si fusionné, montrez juste le score combiné
                createHeroDiv(heroName, category, score, synergyScore, combinedScore, isMergeEnabled, color);

            if (selectedHeroes[heroName]) {
                heroDiv.classList.add('grayscale');
            }

            container.appendChild(heroDiv);
        });
        const img = document.createElement('img');
        img.src = `${window.baseUrl}/Icones/` + category + "Icone.png";
        img.alt = category;
        img.className = "centered-image";
        container.appendChild(img);
    });

    for (const hero in selectedHeroes) {
        if (selectedHeroes[hero]) {
            const synergyScore = getScores(hero, 'synergy', data);
            const opponentScore = getScores(hero, 'opponent', data);

            if (synergyScore !== null) {
                totalSynergyScore += parseFloat(synergyScore);
            }

            if (opponentScore !== null) {
                totalOpponentScore += parseFloat(opponentScore);
            }
        }
    }

    console.log("totalOpponentScore :" + totalOpponentScore);
    console.log("totalSynergyScore :" + totalSynergyScore);

    totals = totalSynergyScore + totalOpponentScore;
    console.log("totals :" + totals);

    document.querySelector('.ScoresTeams').textContent = `${totals.toFixed(2)}`;
    document.querySelector('.ScoresTeamsSynergy').textContent = `${totalSynergyScore.toFixed(2)}`;
    document.querySelector('.ScoresTeamsOpp').textContent = `${totalOpponentScore.toFixed(2)}`;
}


function createHeroDiv(heroName, category, valueScoreOpponent, valueScoreAlly, Scores, isMergeEnabled, color) {
    // Créer le div principal pour le héros


    const div = document.createElement('div');
    div.className = 'fixed-image';
    div.id = `${category}`; // Utiliser l'ID de la catégorie, par exemple 'tanks'
    div.addEventListener('click', function () { moveImage(this); });
    div.setAttribute('data-image', heroName);

    // Créer l'élément img pour l'image du héros
    const img = document.createElement('img');
    img.src = `${window.baseUrl}/` + category + '/' + heroName + '.png';
    img.alt = heroName;

    const score = document.createElement('div');
    score.className = 'label-score-left';

    score.textContent = valueScoreOpponent;
    score.style.color = color;
    score.style.fontWeight = 'bold';
    //console.log("color ", color);
    score.style.color = isMergeEnabled ? '#FFFFFF' : color;
    score.style.justifyContent = isMergeEnabled ? 'center' : 'left';
    score.style.bottom = isMergeEnabled ? '-6px' : '';

    div.setAttribute('data-opponent-score', valueScoreOpponent);
    div.setAttribute('data-ally-score', valueScoreAlly);
    div.setAttribute('data-combined-score', Scores);

    // Créer l'élément p pour le nom du héros
    const p = document.createElement('p');
    p.className = 'image-text';
    p.textContent = heroName;

    // Ajouter img et p au div principal
    div.appendChild(img);
    div.appendChild(score);
    div.appendChild(p);
    if (!isMergeEnabled) {
        const scoreAlly = document.createElement('div');
        scoreAlly.className = 'label-score-right';
        scoreAlly.textContent = valueScoreAlly;
        scoreAlly.style.fontWeight = 'bold';
        div.appendChild(scoreAlly);
    }
    if (allScores.echo.type != null) {
        updateEchoRecommendation()
    }
    return div;
}

function updateEchoRecommendation() {

    const recommendedChampion = allScores.echo.recommended_transformation;
    const championType = allScores.echo.type;


    // Construire le chemin de l'image basé sur le champion recommandé
    const imagePath = `${window.baseUrl}/${championType}/${recommendedChampion}.png`;

    // Sélectionner l'élément où vous voulez afficher l'image (ajustez selon votre HTML)
    const echoImageContainer = document.querySelector(".col-heroes[data-block='1'] [data-image='Echo']");

    if (!echoImageContainer) {
        return;
    }

    const existingRecommendedImg = echoImageContainer.querySelector(".recommended-img");
    if (existingRecommendedImg) {
        echoImageContainer.removeChild(existingRecommendedImg);
    }
    // Créer un nouvel élément img pour l'image recommandée
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = recommendedChampion;
    img.className = "recommended-img";
    img.style.width = '30px'; // Ajustez la taille selon vos besoins
    img.style.height = '30px'; // Ajustez la taille selon vos besoins
    img.style.position = 'absolute'; // Pour le positionnement
    img.style.right = '-5px'; // Pour placer en haut à droite
    img.style.top = '-5px'; // Pour placer en haut à droite
    img.style.boxShadow = "0 0 4px 3px white, 0 0 6px 1px blue, 0 0 7px 4px black";
    img.style.borderRadius = "50%";

    // Ajouter l'image recommandée au conteneur
    echoImageContainer.appendChild(img);

}

function moveImage(element, isReorganizing = false) {

    const blockWidth = document.querySelector('.block').offsetWidth;
    const blockHeight = document.querySelector('.block').offsetHeight;
    const block = element.closest('.col-heroes').getAttribute('data-block');
    heroName = element.getAttribute('data-image')
    let nextAvailableIdTeam1 = null;
    let nextAvailableIdTeam2 = null;
    if (!element.classList.contains('grayscale')) {


        if (!selectedHeroes[heroName]) {
            // Si le héros n'est pas sélectionné, vérifiez d'abord le bloc
            if (block === "1") {
                // Si nous sommes dans le bloc 1, marquez le héros comme sélectionné
                selectedHeroes[heroName] = true;
            }
            // Si le bloc est 2, rien ne se passe ici selon votre requête
        }

        // Vérification des types et des équipes pour la gestion des contraintes
        if (element.id === "tanks" && tanksCountTeam1 < 1) {
            tanksCountTeam1++;
            nextAvailableIdTeam1 = "tank1";
            selectHeroAlly(heroName)
        } else if (element.id === "dps" && dpsCountTeam1 < 2) {
            dpsCountTeam1++;
            if (document.getElementById("dps1").hasChildNodes()) {
                nextAvailableIdTeam1 = "dps2"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam1 = "dps1"; // Le premier DPS est libre, l'utiliser
            }
            selectHeroAlly(heroName)
        } else if (element.id === "healers" && supportCountTeam1 < 2) {
            supportCountTeam1++;
            if (document.getElementById("supp1").hasChildNodes()) {
                nextAvailableIdTeam1 = "supp2"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam1 = "supp1"; // Le premier DPS est libre, l'utiliser
            }
            selectHeroAlly(heroName)
        } else if (element.id === "tanks2" && tanksCountTeam2 < 1) {
            tanksCountTeam2++;
            nextAvailableIdTeam2 = "tank2";
            selectHeroOpponent(heroName)
        } else if (element.id === "dps2" && dpsCountTeam2 < 2) {
            dpsCountTeam2++;
            if (document.getElementById("dps3").hasChildNodes()) {
                nextAvailableIdTeam2 = "dps4"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam2 = "dps3"; // Le premier DPS est libre, l'utiliser
            }
            selectHeroOpponent(heroName)
        } else if (element.id === "healers2" && supportCountTeam2 < 2) {
            supportCountTeam2++;
            if (document.getElementById("supp3").hasChildNodes()) {
                nextAvailableIdTeam2 = "supp4"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam2 = "supp3"; // Le premier DPS est libre, l'utiliser
            }
            selectHeroOpponent(heroName)
        } else {
            console.log("Champion limit reached for this type or team.");
            selectedHeroes[heroName] = false;
            return;
        }

        // Ajout de l'image au bloc approprié
        if (nextAvailableIdTeam1) {
            //console.log(nextAvailableIdTeam1)
            const image = element.querySelector('img').cloneNode(true);

            image.classList.add('cloned-image');
            image.style.width = `${blockWidth}px`;
            image.style.height = `${blockHeight}px`;

            element.classList.add('grayscale');

            const targetContainer = document.getElementById(nextAvailableIdTeam1);
            targetContainer.appendChild(image);
            image.setAttribute('data-hero-name', element.getAttribute('data-image'));

            image.addEventListener('click', function () {
                // Appeler removeHeroOpponent en utilisant data-hero-name
                removeHeroAlly(image.getAttribute('data-hero-name'));
                // Supprimer l'image clonée du DOM
                image.remove();
                // Mettre à jour le visuel de l'élément original si nécessaire
                element.classList.remove('grayscale');
                // Mettre à jour l'état pour refléter que le héros n'est plus sélectionné
                delete selectedHeroes[this.getAttribute('data-hero-name')];
                // Ajuster les compteurs en fonction de la position de l'image retirée
                tanksCountTeam1 -= nextAvailableIdTeam1.includes("tank") ? 1 : 0;
                dpsCountTeam1 -= nextAvailableIdTeam1.includes("dps") ? 1 : 0;
                supportCountTeam1 -= nextAvailableIdTeam1.includes("supp") ? 1 : 0;
            });


        } else if (nextAvailableIdTeam2) {
            const image = element.querySelector('img').cloneNode(true);
            image.classList.add('cloned-image2');
            image.style.width = `${blockWidth}px`;
            image.style.height = `${blockHeight}px`;

            element.classList.add('grayscale');

            const targetContainer = document.getElementById(nextAvailableIdTeam2);
            targetContainer.appendChild(image);
            image.setAttribute('data-hero-name', element.getAttribute('data-image'));

            image.addEventListener('click', function () {
                // Appeler removeHeroOpponent en utilisant data-hero-name
                removeHeroOpponent(this.getAttribute('data-hero-name'));
                // Supprimer l'image clonée du DOM
                this.remove();
                // Mettre à jour le visuel de l'élément original si nécessaire
                element.classList.remove('grayscale');
                // Mettre à jour l'état pour refléter que le héros n'est plus sélectionné
                delete selectedHeroes[this.getAttribute('data-hero-name')];
                // Ajuster les compteurs en fonction de la position de l'image retirée
                tanksCountTeam2 -= nextAvailableIdTeam2.includes("tank") ? 1 : 0;
                dpsCountTeam2 -= nextAvailableIdTeam2.includes("dps") ? 1 : 0;
                supportCountTeam2 -= nextAvailableIdTeam2.includes("supp") ? 1 : 0;
            });
        }
    } else if (element.classList.contains('grayscale')) {
        if (element.id === "tanks" && tanksCountTeam1 > 0) {
            tanksCountTeam1--;
            nextAvailableIdTeam1 = "tank1";
            delete selectedHeroes[element.getAttribute('data-image')];
            removeHeroAlly(heroName)
        } else if (element.id === "dps" && dpsCountTeam1 > 0) {
            dpsCountTeam1--;
            if (document.getElementById("dps1").hasChildNodes()) {
                nextAvailableIdTeam1 = "dps2"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam1 = "dps1"; // Le premier DPS est libre, l'utiliser
            }
            delete selectedHeroes[element.getAttribute('data-image')];
            removeHeroAlly(heroName)
        } else if (element.id === "healers" && supportCountTeam1 > 0) {
            supportCountTeam1--;
            if (document.getElementById("supp1").hasChildNodes()) {
                nextAvailableIdTeam1 = "supp2"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam1 = "supp1"; // Le premier DPS est libre, l'utiliser
            }
            delete selectedHeroes[element.getAttribute('data-image')];
            removeHeroAlly(heroName)
        } else if (element.id === "tanks2" && tanksCountTeam2 > 0) {
            tanksCountTeam2--;
            nextAvailableIdTeam2 = "tank2";
            removeHeroOpponent(heroName)
        } else if (element.id === "dps2" && dpsCountTeam2 > 0) {
            dpsCountTeam2--;
            if (document.getElementById("dps3").hasChildNodes()) {
                nextAvailableIdTeam2 = "dps4"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam2 = "dps3"; // Le premier DPS est libre, l'utiliser
            }

            delete selectedHeroes[element.getAttribute('data-hero-name')];
            removeHeroOpponent(heroName)
        } else if (element.id === "healers2" && supportCountTeam2 > 0) {
            supportCountTeam2--;
            if (document.getElementById("supp4").hasChildNodes()) {
                nextAvailableIdTeam2 = "supp3"; // Le premier DPS est pris, utilise le second
            } else {
                nextAvailableIdTeam2 = "supp4"; // Le premier DPS est libre, l'utiliser
            }

            delete selectedHeroes[element.getAttribute('data-hero-name')];
            removeHeroOpponent(heroName)
        } else {
            console.log("Champion limit reached for this type or team.");
            selectedHeroes[heroName] = false;
            return;
        }

        if (nextAvailableIdTeam2) {
            // Sélectionner l'image clonée spécifique basée sur le data-hero-name
            const clonedImage = document.querySelector(`.cloned-image2[data-hero-name="${heroName}"]`);

            if (clonedImage) {
                // Supprimer l'image clonée du DOM
                clonedImage.remove();

                // Restaurer l'état visuel de l'élément original
                element.classList.remove('grayscale');

            }

        } else if (nextAvailableIdTeam1) {
            const clonedImage = document.querySelector(`.cloned-image[data-hero-name="${heroName}"]`);

            if (clonedImage) {
                // Supprimer l'image clonée du DOM
                clonedImage.remove();

                // Restaurer l'état visuel de l'élément original
                element.classList.remove('grayscale');

                // Mettre à jour l'état pour refléter que le héros n'est plus sélectionné

            }
        }
    }
}

//Cette fonction semble ne servir à rien
function toggleScoresVisibility(isMergeEnabled) {
    document.querySelectorAll('.fixed-image').forEach(div => {
        if (!div.hasAttribute('data-opponent-score')) {
            return; // Cette fonction permet de sortir de la boucle car il y a une erreur de valeur non trouvée dans la colonne .fixed-image ennemy car il n'y a pas de score. 
            // donc normal
        }
        const scoreOpponent = parseFloat(div.getAttribute('data-opponent-score')) || 0;
        const scoreAlly = parseFloat(div.getAttribute('data-ally-score')) || 0;
        const scoreDiv = div.querySelector('.label-score-left');
        const scoreAllyDiv = div.querySelector('.label-score-right');
        const combinedScore = isMergeEnabled ? (scoreOpponent + scoreAlly).toFixed(0) : scoreOpponent;

        if (isMergeEnabled) {
            // Affiche le score combiné et ajuste le style
            scoreDiv.textContent = combinedScore;
            scoreDiv.style.color = '#f30ba6';
            if (scoreAllyDiv) scoreAllyDiv.style.display = 'none';
        } else {
            // Fonction pour normaliser le scoreOpponent entre 0 et 1
            //updateHeroContainers(allScores)
            if (scoreAllyDiv) {
                scoreAllyDiv.textContent = scoreAlly;
                scoreAllyDiv.style.display = '';
            }
        }
    });
}