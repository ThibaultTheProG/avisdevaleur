# Comparaison « application ↔ classeurs Excel »

Banc différentiel entre `calculerAvis` et les deux classeurs de référence de
`design_handoff_avis_de_valeur/assets/`.

L'oracle **n'est pas une réécriture des formules** : `oracle_excel.py` lit les
formules du `.xlsx` avec openpyxl et les évalue telles quelles. Seuls les taux
saisis à la main *dans* le classeur (véranda 50 %, DPE, coûts au m²…) y sont
recopiés, depuis les libellés visibles — ils sont donc indépendants du
référentiel de l'application, et l'écart entre les deux est lui-même mesuré.

## Lancer

```bash
pnpm test:excel                                   # 2000 scénarios, mode neutre
node scripts/comparaison-excel/comparer.ts 500            # mode complet
node scripts/comparaison-excel/comparer.ts 2000 --base    # effet de la base seule
node scripts/comparaison-excel/comparer.ts 500 --neutre --detail 6   # un scénario
```

Prérequis : `python3` avec `openpyxl`.

## Les trois modes

| Mode | Ce qu'il neutralise | À quoi il sert |
|---|---|---|
| `--neutre` | surfaces sous la médiane, % dans les plafonds, lignes absentes du classeur inactives | **Non-régression.** Doit rester à 0 écart. |
| `--base` | plafonds et lignes absentes seulement | Chiffre l'effet du choix de base des pourcentages. |
| *(aucun)* | rien | Vue d'ensemble, tous écarts confondus. |

Le mode `--neutre` est le test : les écarts voulus étant hors jeu,
tout écart qui y apparaît est une régression du calculateur.

## Écarts avec les classeurs : voulus, pas à corriger

**L'application fait foi sur les champs et les valeurs de calcul.** Avant le
développement, le client a énoncé de nombreux ajustements, maquette à l'appui ;
la maquette et `REGLES_DE_CALCUL.md` en portent le résultat. Les classeurs sont
l'outil *antérieur* et n'ont pas été mis à jour.

Les six écarts ci-dessous sont donc **attendus**. Ne jamais aligner le calcul sur
les classeurs : ce serait défaire des décisions client.

1. **Base des pourcentages.** Le classeur applique tous les % à `surface × prix/m²`
   et soustrait la décote de grande surface en fin, comme une minoration. Le
   handoff l'intègre à `prixReference`, base de tous les %. Écart médian **3,6 %**
   sur la valeur intrinsèque retenue, 16,5 % au 90e centile.
2. **Surface médiane appartement** : classeur « Référence 65 m2 », application 60.
3. **« Nuisance ou risque »** : ajoutée à l'appartement (le classeur maison seul la
   portait).
4. **« Travaux complémentaires »** : minoration ajoutée aux deux types.
5. **Plafonds vue et nuisance** : portés de « 5 % à 25 % » à 30 %.
6. **Tendance de marché** : trois crans (+5 / 0 / −5 %) au lieu des deux du
   classeur (100 % ou 95 %, ce dernier figé dans `G32`).

Le point 1 est le seul que les conseillers habitués au tableur remarqueront. Le
mode `--base` sert à le leur expliquer, pas à le remettre en cause.

## Ce qui concorde au centime

Les 26 autres critères, sur les deux types de bien et les six `kind` de formule :
véranda 50 %, annexe 25 %, souplex/sous-sol, coûts 250 / 1250 €/m², barèmes DPE
(distincts par type), terrasse 15 %, terrain paysagé et mal agencé 5–10 %, et
tous les interrupteurs et options à taux fixe.
