import os
from flask import Flask, render_template, request, jsonify, session, send_from_directory
from joblib import load
import lightgbm as lgb
import pandas as pd
import numpy as np
from flask_wtf import CSRFProtect
from dotenv import load_dotenv
import logging
import sys

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
# Clé secrète nécessaire pour la session et la protection CSRF
app.config['SECRET_KEY'] = '\x08J/\x9e\xc6\\\xf4p\n\x17l\xd9\x96\x11\x85\xb8s\xf5\x18#i\xda!w'
csrf = CSRFProtect(app)
load_dotenv()
app.secret_key = os.getenv('SECRET_KEY')


app.logger.setLevel(logging.DEBUG)

ENV = os.getenv('FLASK_ENV', 'dev')
@app.context_processor
def inject_stage():
    if ENV == 'dev':
        return dict(stage='dev')
    else:
        return dict(stage='')


# Liste des dossiers à parcourir
dossiers = [os.path.join('static', 'Heroes', 'dps'),
            os.path.join('static', 'Heroes', 'healers'),
            os.path.join('static', 'Heroes', 'tanks')]

# Fonction pour obtenir les noms de fichiers sans extension et le nom du dossier


def get_noms_fichiers_et_dossier(dossier):
    noms_fichiers_sans_extension = []
    dossier_absolu = os.path.join(app.root_path, dossier)
    nom_dossier = os.path.basename(dossier)
    for root, _, files in os.walk(dossier_absolu):
        for fichier in files:
            nom_fichier, extension = os.path.splitext(fichier)
            noms_fichiers_sans_extension.append(nom_fichier)
    return nom_dossier, noms_fichiers_sans_extension


# Initialisation des listes pour chaque catégorie et la liste all_heroes
dps = []
healers = []
tanks = []
dossiers_categories = []
all_heroes = []

# Parcours des dossiers et ajout des noms de fichiers sans extension aux listes correspondantes
for dossier in dossiers:
    nom_dossier, noms_fichiers = get_noms_fichiers_et_dossier(dossier)
    if nom_dossier == 'dps':
        dps.extend(noms_fichiers)
    elif nom_dossier == 'healers':
        healers.extend(noms_fichiers)
    elif nom_dossier == 'tanks':
        tanks.extend(noms_fichiers)
    dossiers_categories.append(nom_dossier)
    all_heroes.extend(noms_fichiers)

all_heroes = sorted(all_heroes)
dps = sorted(dps)
healers = sorted(healers)
tanks = sorted(tanks)

# Affichage des listes de héros par catégorie, des dossiers correspondants et de la liste all_heroes
'''for i, categorie in enumerate(dossiers_categories):
    print(f"Catégorie: {categorie}")
    if categorie == 'Dps':
        print("Héros Dps:", dps)
    elif categorie == 'Support':
        print("Héros Support:", healers)
    elif categorie == 'Tanks':
        print("Héros Tanks:", tanks)
    print()

print("Liste de tous les héros (all_heroes):", all_heroes)'''


def one_hot_encode(team, exclude_category=[]):
    encoding = [
        1 if hero in team and hero not in exclude_category else 0 for hero in all_heroes]
    return encoding

# Maintenant, 'enemy_encoded_extended' a la même longueur que les lignes de 'X_train_tank'
model_tank = load('Models/model_tanks.joblib')
model_dps = load('Models/model_dps.joblib')
model_healer = load('Models/model_healers.joblib')


Synmodel_tanks = load('Models/Synmodel_tanks.joblib')
Synmodel_dps = load('Models/Synmodel_dps.joblib')
Synmodel_healers = load('Models/Synmodel_healers.joblib')

# model_echo = load('Models/model_echo.joblib')


def make_predictions(selected_opponent_champions_, selected_ally_champions_):
    # Transformer les listes en données encodées
    # encoded_ally = one_hot_encode(selected_ally_champions)
    # test_team = ['Sigma', 'Mei', 'Bastion', 'Moira', 'Ana']

    encoded_enemy = one_hot_encode(selected_opponent_champions_)
    encoded_ally = one_hot_encode(selected_ally_champions_)

    encoded_ally_tanks = one_hot_encode(selected_ally_champions_, exclude_category=tanks)
    
    ally_dps = [hero for hero in selected_ally_champions_ if hero in dps]
    ally_healers = [hero for hero in selected_ally_champions_ if hero in healers]

    feature_names = all_heroes

    encoded_enemy = pd.DataFrame([encoded_enemy], columns=feature_names)
    encoded_ally = pd.DataFrame([encoded_ally], columns=feature_names)
    encoded_ally_tanks_df = pd.DataFrame([encoded_ally_tanks], columns=feature_names)

    # Appeler les modèles pour obtenir les prédictions
    if not any(hero in selected_ally_champions_ for hero in tanks):
        predicted_syntank_efficiency = round_predictions(
            ranked_tanks(Synmodel_tanks.predict(encoded_ally)[0]))
    else:
        predicted_syntank_efficiency = round_predictions(
            ranked_tanks(Synmodel_tanks.predict(encoded_ally_tanks_df)[0]))

    if len(ally_dps) <= 1:
        predicted_syndps_efficiency = round_predictions(ranked_dps(Synmodel_dps.predict(encoded_ally)[0]))
    else:
        encoded_ally_dps = one_hot_encode(selected_ally_champions_, exclude_category=ally_dps[1:])
        encoded_ally_dps_df = pd.DataFrame([encoded_ally_dps], columns=feature_names)
        predicted_syndps_efficiency = round_predictions(ranked_dps(Synmodel_dps.predict(encoded_ally_dps_df)[0]))

    # Prédictions pour les Healers alliés
    if len(ally_healers) <= 1:
        predicted_synhealer_efficiency = round_predictions(ranked_healers(Synmodel_healers.predict(encoded_ally)[0]))
    else:
        encoded_ally_healers = one_hot_encode(selected_ally_champions_, exclude_category=ally_healers[1:])
        encoded_ally_healers_df = pd.DataFrame([encoded_ally_healers], columns=feature_names)
        predicted_synhealer_efficiency = round_predictions(ranked_healers(Synmodel_healers.predict(encoded_ally_healers_df)[0]))


    predicted_tank_efficiency = model_tank.predict(encoded_enemy)
    predicted_dps_efficiency = model_dps.predict(encoded_enemy)
    predicted_healer_efficiency = model_healer.predict(encoded_enemy)
    # predicted_echo_efficiency = model_echo.predict(encoded_enemy)
    # max_score_index = np.argmax(predicted_echo_efficiency.flatten())

    # max_score_for_echo = float(predicted_echo_efficiency.flatten()[max_score_index])

    '''predicted_syntank_efficiency = Synmodel_tanks.predict(encoded_ally)
    predicted_syndps_efficiency = Synmodel_dps.predict(encoded_ally)
    predicted_synhealer_efficiency = Synmodel_healers.predict(encoded_ally)'''

    efficiency_scores_tank = round_predictions(
        ranked_tanks(predicted_tank_efficiency[0]))
    efficiency_scores_dps = round_predictions(
        ranked_dps(predicted_dps_efficiency[0]))
    efficiency_scores_healer = round_predictions(
        ranked_healers(predicted_healer_efficiency[0]))

    # Echo => on récupère tous les scores d'efficacités conrrespondant aux héros sélecitonnés et on les regroupe
    filtered_champions = [
        (champion, score)
        for champion, score in (efficiency_scores_tank + efficiency_scores_dps + efficiency_scores_healer)
        if champion in selected_opponent_champions_
    ]

    if filtered_champions:
        # on récupère le score de base de echo
        recommended_champion_for_echo = max(
            filtered_champions, key=lambda x: x[1])[0]
        recommended_champion_for_echo_score = max(
            filtered_champions, key=lambda x: x[1])[1]

        score_echo = next(
            (item for item in efficiency_scores_dps if item[0].lower() == 'echo'), None)

        # on ajoute le score de base de echo à celui du champion copié
        score_echo = round(score_echo[1] * (0.5 - 15*8 / 855) +
                           recommended_champion_for_echo_score * (15*8 / 855), 2)

        efficiency_scores_dps = [
            (champion, round((score + score_echo), 2)
             ) if champion.lower() == 'echo' else (champion, score)
            for champion, score in efficiency_scores_dps
        ]
        efficiency_scores_dps = sorted(
            efficiency_scores_dps, key=lambda x: x[1], reverse=True)
    else:
        recommended_champion_for_echo_score = ""
        recommended_champion_for_echo = ""
        champion_type = None

    # Préparer les résultats*
    results = {
        "opponent": {
            "tanks": efficiency_scores_tank,
            "dps": efficiency_scores_dps,
            "healers": efficiency_scores_healer
        },
        "synergy": {
            "tanks": predicted_syntank_efficiency,
            "dps": predicted_syndps_efficiency,
            "healers": predicted_synhealer_efficiency
        }
    }
    champion_type = find_champion_type(
        results, recommended_champion_for_echo)
    results["echo"] = {
        # Supposons que vous vouliez juste stocker le nom du champion recommandé et son score
        "recommended_transformation": recommended_champion_for_echo,
        # Arrondir le score pour simplifier
        "efficiency_score": recommended_champion_for_echo_score,
        "type": champion_type
    }

    # final_score = echo_base_score * (1 - T / M) + max_copied_score * (T / M)
    # recommended_champion_for_echo = feature_names[max_score_index]

    # Gérez le cas où aucun champion n'est recommandé

    # Classement des héros par efficacité prédite
    '''ranked_tank = round_predictions(ranked_tanks(predicted_tank_efficiency[0]))
    ranked_dp = round_predictions(ranked_dps(predicted_dps_efficiency[0]))
    ranked_healer = round_predictions(ranked_healers(predicted_healer_efficiency[0]))'''

    # Afficher les héros classés
    '''print("Tanks classés du plus efficace au moins efficace:")
    for hero, efficiency in ranked_tank:
        print(f"{hero}: {efficiency}")

    print("\nDPS classés du plus efficace au moins efficace:")
    for hero, efficiency in ranked_dp:
        print(f"{hero}: {efficiency}")

    print("\nHealers classés du plus efficace au moins efficace:")
    for hero, efficiency in ranked_healer:
        print(f"{hero}: {efficiency}")'''

    return results


def find_champion_type(results, recommended_champion_for_echo):
    for category, champions in results["opponent"].items():
        if recommended_champion_for_echo in [champ[0] for champ in champions]:
            return category
    return None


def ranked_tanks(efficiency_scores):
    return sorted(zip(tanks, efficiency_scores), key=lambda x: x[1], reverse=True)


def ranked_dps(efficiency_scores):
    return sorted(zip(dps, efficiency_scores), key=lambda x: x[1], reverse=True)


def ranked_healers(efficiency_scores):
    return sorted(zip(healers, efficiency_scores), key=lambda x: x[1], reverse=True)


def round_predictions(predictions):
    return [(hero, round(efficiency, 2)) for hero, efficiency in predictions]

def route_prefix(path):
    """Custom route decorator to handle environment-specific prefixes."""
    if ENV == 'dev':
        return f"/dev{path}"
    return path


@app.route(route_prefix('/'))
def index():
    directory = os.path.abspath(os.path.join(
        os.path.dirname(__file__),  './static/Heroes/tanks/'))
    imagestank = [os.path.splitext(f)[0] for f in os.listdir(
        directory) if f.endswith('.png')]
    directory = os.path.abspath(os.path.join(
        os.path.dirname(__file__),  './static/Heroes/healers/'))
    imagessupport = [os.path.splitext(f)[0] for f in os.listdir(
        directory) if f.endswith('.png')]
    directory = os.path.abspath(os.path.join(
        os.path.dirname(__file__),  './static/Heroes/dps/'))
    imagesdps = [os.path.splitext(f)[0] for f in os.listdir(
        directory) if f.endswith('.png')]
    return render_template('index.html', imagestank=imagestank, imagessupport=imagessupport, imagesdps=imagesdps)


@app.route(route_prefix('/ally_champion'), methods=['POST'])
def select_ally_champion():
    if request.method == 'POST':
        champion_name = request.form.get('ally_champion')
        selected_ally_champions = session.get('selected_ally_champions', [])
        #print("add_ally_champion avant post", selected_ally_champions)
        if 'selected_ally_champions' not in session:
            session['selected_ally_champions'] = []
        session['selected_ally_champions'].append(champion_name)
        session.modified = True
        selected_opponent_champions = session.get(
            'selected_opponent_champions', [])
        for element in selected_ally_champions:
            print(element)
        # Faire quelque chose avec le champion sélectionné, comme l'enregistrer dans une base de données ou effectuer un traitement
        # Répondre avec un message ou une confirmation
        predictions = make_predictions(
            selected_opponent_champions, selected_ally_champions)
        #print(predictions)
        return jsonify(predictions)
    else:
        return "Wrong HTTP method used for this endpoint"


@app.route(route_prefix('/opponent_champion'), methods=['POST'])
def select_adversary_champion():
    if request.method == 'POST':
        champion_name = request.form.get('opponent_champion')
        if 'selected_opponent_champions' not in session:
            session['selected_opponent_champions'] = []
        session['selected_opponent_champions'].append(champion_name)
        session.modified = True
        selected_ally_champions = session.get('selected_ally_champions', [])
        selected_opponent_champions = session.get(
            'selected_opponent_champions', [])
        for element in selected_opponent_champions:
            print(element)
        predictions = make_predictions(
            selected_opponent_champions, selected_ally_champions)
        # print(predictions)
        return jsonify(predictions)
    else:
        return "Wrong HTTP method used for this endpoint"


@app.route(route_prefix('/remove_ally_champion'), methods=['POST'])
def remove_ally_champion():
    if request.method == 'POST':
        champion_name = request.form.get('ally_champion')
        selected_ally_champions = session.get('selected_ally_champions', [])
        # print("remove_ally_champion ", selected_ally_champions)
        if champion_name in selected_ally_champions:
            selected_ally_champions.remove(champion_name)
            print("remove_ally_champion ", selected_ally_champions)
            session['selected_ally_champions'] = selected_ally_champions
            selected_opponent_champions = session.get(
                'selected_opponent_champions', [])
            session.modified = True
            for element in selected_ally_champions:
                print(element)
            predictions = make_predictions(
                selected_opponent_champions, selected_ally_champions)
            # print(predictions)
            return jsonify(predictions)
        else:
            return f"Champion allié non trouvé : {champion_name}"
    else:
        return "Wrong HTTP method used for this endpoint"


@app.route(route_prefix('/remove_opponent_champion'), methods=['POST'])
def remove_opponent_champion():
    if request.method == 'POST':
        champion_name = request.form.get('opponent_champion')
        selected_opponent_champions = session.get(
            'selected_opponent_champions', [])
        if champion_name in selected_opponent_champions:
            selected_opponent_champions.remove(champion_name)
            session['selected_opponent_champions'] = selected_opponent_champions
            selected_ally_champions = session.get(
                'selected_ally_champions', [])
            session.modified = True
            for element in selected_opponent_champions:
                print(element)
            predictions = make_predictions(
                selected_opponent_champions, selected_ally_champions)
            # print(predictions)
            return jsonify(predictions)
        else:
            return f"Champion ennemi non trouvé : {champion_name}"
    else:
        return "Wrong HTTP method used for this endpoint"


@app.route(route_prefix('/reset_champions'), methods=['POST'])
def reset_champions():
    if request.method == 'POST':
        session['selected_ally_champions'] = []
        session['selected_opponent_champions'] = []
        session.modified = True
        selected_opponent_champions = session.get(
            'selected_opponent_champions', [])
        selected_ally_champions = session.get('selected_ally_champions', [])
        session.modified = True
        predictions = make_predictions(
            selected_opponent_champions, selected_ally_champions)
        # print(predictions)
        return jsonify(predictions)
    else:
        return "Wrong HTTP method used for this endpoint"


@app.route('/robots.txt')
def robots_txt():
    return send_from_directory('static', 'robots.txt')

@app.route('/ads.txt')
def ads_txt():
    return send_from_directory('static', 'ads.txt')

@app.route(route_prefix('/source.html'))
def sources():
    return render_template('source.html')


@app.route('/sitemap.xml')
def sitemap_xml():
    return send_from_directory('static', 'sitemap.xml')


@app.route('/google640d04f74d844b32.html')
def google_search_console():
    return send_from_directory('static', 'google640d04f74d844b32.html')


if __name__ == "__main__":    
    logging.debug("Starting the Flask app.")
    app.run(debug=True)
