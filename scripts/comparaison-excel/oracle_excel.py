#!/usr/bin/env python3
"""
Oracle Excel — évalue les classeurs de `design_handoff_avis_de_valeur/assets/`.

Ce script ne réécrit AUCUNE formule : il lit celles du fichier .xlsx avec
openpyxl et les évalue. Les seuls nombres écrits ici sont ceux qui, dans le
classeur, sont saisis à la main dans une cellule (taux de véranda, barème DPE,
coûts au m²…) — ils sont repris des libellés visibles du classeur, cités en
commentaire. L'oracle est donc indépendant du référentiel de l'application.

Entrée : un JSON de scénarios sur stdin. Sortie : un JSON de résultats.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

ASSETS = Path(__file__).resolve().parents[3] / "design_handoff_avis_de_valeur" / "assets"
CLASSEURS = {
    "maison": ASSETS / "Copie de Avis de valeur intrinsèque - Maison - vierge.xlsx",
    "appartement": ASSETS / "Copie de Avis de valeur intrinsèque - Appartement - vierge.xlsx",
}

# ── Taux saisis en dur DANS le classeur, repris de ses libellés ──────────────
# « Véranda ou loggia habitable/chauffée (50% du prix m2 médian) »
TAUX_VERANDA = 0.50
# « Surface annexe, cave ou cellier (25% du prix m2 médian) »
TAUX_ANNEXE = 0.25
# « Surface supérieure à la moyenne constatée = 50% du prix du m2 »
TAUX_GRANDE_SURFACE = 0.50
# « Rafraîchissement … environ 250€ du m2 » / « Rénovation … environ 1250€ du m2 »
COUT_RAFRAICHISSEMENT = 250.0
COUT_RENOVATION = 1250.0
# « Référecne 90 m2 » (maison) / « Référence 65 m2 » (appartement)
MEDIANE = {"maison": 90.0, "appartement": 65.0}
# « Valorisation DPE en C +5% - DPE en B +10% - DPE en A +15% » et la ligne de
# dévalorisation, qui diffère d'un classeur à l'autre.
DPE = {
    "maison": {"A": 0.15, "B": 0.10, "C": 0.05, "D": 0.0, "E": -0.10, "F": -0.15, "G": -0.25},
    "appartement": {"A": 0.15, "B": 0.10, "C": 0.05, "D": 0.0, "E": -0.05, "F": -0.10, "G": -0.15},
}
# « Marché à la hausse : 100% - Marché à la baisse : 95% de la valeur »
# Le classeur ne propose pas d'autre cran ; G32/G31 fige d'ailleurs 0.95.

# ── Où chaque critère se saisit, feuille par feuille ─────────────────────────
# (cellule surface, cellule taux/%, cellule résultat)
PLAN = {
    "maison": {
        "surfaceHabitable": "C4", "prixM2": "E4", "prixReference": "G4",
        "total": "G28", "net": "G32",
        "lignes": {
            "veranda":            {"surface": "C7",  "taux": "E7",  "res": "G7"},
            "annexe":             {"surface": "C8",  "taux": "E8",  "res": "G8"},
            "vue":                {"pct": "E9",  "res": "G9"},
            "orientationSud":     {"pct": "E10", "res": "G10"},
            "travauxRecents":     {"montant": "G11", "res": "G11"},
            "plainPied":          {"pct": "E12", "res": "G12"},
            "nonMitoyen":         {"pct": "E13", "res": "G13"},
            "terrainPaysage":     {"pct": "E14", "res": "G14"},
            "dpeMajoration":      {"pct": "E15", "res": "G15"},
            "etages":             {"pct": "E18", "res": "G18"},
            "mitoyenDeuxCotes":   {"pct": "E19", "res": "G19"},
            "grandeSurface":      {"surface": "C20", "taux": "E20", "res": "G20"},
            "dpeMinoration":      {"pct": "E21", "res": "G21"},
            "rafraichissement":   {"surface": "C22", "taux": "E22", "res": "G22"},
            "renovation":         {"surface": "C23", "taux": "E23", "res": "G23"},
            "malAgence":          {"pct": "E24", "res": "G24"},
            "nuisance":           {"pct": "E25", "res": "G25"},
            "sansTerrain":        {"pct": "E26", "res": "G26"},
            "sansGarage":         {"pct": "E27", "res": "G27"},
        },
    },
    "appartement": {
        "surfaceHabitable": "C4", "prixM2": "E4", "prixReference": "G4",
        "total": "G27", "net": "G31",
        "lignes": {
            "veranda":                      {"surface": "C6",  "taux": "E6",  "res": "G6"},
            "annexe":                       {"surface": "C7",  "taux": "E7",  "res": "G7"},
            "vue":                          {"pct": "E8",  "res": "G8"},
            "orientationSud":               {"pct": "E9",  "res": "G9"},
            "travauxRecents":               {"montant": "G10", "res": "G10"},
            "terrasse":                     {"pct": "E11", "res": "G11"},
            "partiesCommunesHautDeGamme":   {"pct": "E12", "res": "G12"},
            "dpeMajoration":                {"pct": "E13", "res": "G13"},
            "souplexSousSol":               {"surface": "C16", "taux": "E16", "res": "G16"},
            "rdcVisAVis":                   {"pct": "E17", "res": "G17"},
            "partiesCommunesARafraichir":   {"pct": "E18", "res": "G18"},
            "grandeSurface":                {"surface": "C19", "taux": "E19", "res": "G19"},
            "dpeMinoration":                {"pct": "E20", "res": "G20"},
            "rafraichissement":             {"surface": "C21", "taux": "E21", "res": "G21"},
            "renovation":                   {"surface": "C22", "taux": "E22", "res": "G22"},
            "sansParking":                  {"pct": "E23", "res": "G23"},
            "majoriteLocataires":           {"pct": "E24", "res": "G24"},
            "sansAscenseur":                {"pct": "E25", "res": "G25"},
            "sansBalcon":                   {"pct": "E26", "res": "G26"},
        },
    },
}

REF = re.compile(r"\b([A-Z]{1,2})(\d{1,3})\b")


def charger_formules(chemin):
    ws = openpyxl.load_workbook(chemin, data_only=False).worksheets[0]
    formules = {}
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and c.value.startswith("="):
                formules[c.coordinate] = c.value[1:]
    return formules


class Feuille:
    """Évaluateur minimal : les formules viennent du fichier, jamais d'ici."""

    def __init__(self, formules, saisies):
        self.formules = formules
        self.saisies = saisies
        self.cache = {}

    def val(self, coord):
        if coord in self.saisies:
            return float(self.saisies[coord])
        if coord in self.cache:
            return self.cache[coord]
        f = self.formules.get(coord)
        if f is None:
            return 0.0
        self.cache[coord] = 0.0  # garde-fou anti-cycle
        # SUM(X) sur une référence simple == X ; c'est le seul appel du classeur.
        expr = f.replace("SUM(", "(")
        expr = REF.sub(lambda m: f'self.val("{m.group(1)}{m.group(2)}")', expr)
        v = float(eval(expr, {"self": self}))  # noqa: S307 — expression arithmétique du classeur
        self.cache[coord] = v
        return v


def saisir(scenario):
    """Traduit un scénario neutre en cellules du classeur."""
    t = scenario["type"]
    plan = PLAN[t]
    s = {
        plan["surfaceHabitable"]: scenario["surfaceHabitable"],
        plan["prixM2"]: scenario["prixM2"],
    }
    crit = scenario.get("criteres", {})

    for cle, saisie in crit.items():
        if cle not in plan["lignes"]:
            continue  # critère sans équivalent dans le classeur — signalé par le pilote
        cellules = plan["lignes"][cle]
        if "montant" in cellules:
            s[cellules["montant"]] = saisie["montant"]
        elif "surface" in cellules:
            s[cellules["surface"]] = saisie["surface"]
            # « taux » pour les lignes en % du prix/m², « coutM2 » en euros/m².
            s[cellules["taux"]] = saisie.get("taux", saisie.get("coutM2"))
        else:
            s[cellules["pct"]] = saisie["pourcentage"]

    # Taux figés du classeur pour les lignes « surface »
    for cle, taux in (("veranda", TAUX_VERANDA), ("annexe", TAUX_ANNEXE)):
        if cle in crit:
            s[plan["lignes"][cle]["taux"]] = taux
    for cle, cout in (("rafraichissement", COUT_RAFRAICHISSEMENT), ("renovation", COUT_RENOVATION)):
        if cle in crit and "coutM2" in crit[cle]:
            s[plan["lignes"][cle]["taux"]] = crit[cle]["coutM2"]

    # Décote de grande surface : ligne de MINORATION du classeur, saisie à la main.
    mediane = scenario.get("surfaceMediane") or MEDIANE[t]
    excedent = max(0.0, float(scenario["surfaceHabitable"]) - float(mediane))
    if excedent > 0:
        s[plan["lignes"]["grandeSurface"]["surface"]] = excedent
        s[plan["lignes"]["grandeSurface"]["taux"]] = TAUX_GRANDE_SURFACE

    # DPE : une ligne en majoration, une en minoration.
    lettre = scenario.get("dpe")
    if lettre:
        taux = DPE[t][lettre]
        if taux > 0:
            s[plan["lignes"]["dpeMajoration"]["pct"]] = taux
        elif taux < 0:
            s[plan["lignes"]["dpeMinoration"]["pct"]] = abs(taux)
    return s


def main():
    scenarios = json.load(sys.stdin)
    formules = {t: charger_formules(p) for t, p in CLASSEURS.items()}
    out = []
    for sc in scenarios:
        plan = PLAN[sc["type"]]
        f = Feuille(formules[sc["type"]], saisir(sc))
        intrinseque = f.val(plan["total"])
        out.append({
            "id": sc["id"],
            "prixReference": f.val(plan["prixReference"]),
            "valeurIntrinseque": intrinseque,
            "netVendeur095": f.val(plan["net"]),
            "lignes": {
                cle: f.val(c["res"]) for cle, c in plan["lignes"].items() if "res" in c
            },
        })
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
