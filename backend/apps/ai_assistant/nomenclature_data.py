"""
Nomenclature des déchets — Décret exécutif n°06-104
Référentiel national des déchets (208 codes officiels)
Mirroir exact de frontend/src/pages/nomenclature/nomenclatureData.js

Utilisé par l'Assistant IA pour garantir la cohérence avec la page Nomenclature.
"""

FAMILLES = {
    '1': 'Déchets de l\'exploration et extraction minière',
    '2': 'Déchets agricoles et de la préparation alimentaire',
    '3': 'Déchets du bois et du papier',
    '4': 'Déchets du cuir, de la fourrure et du textile',
    '5': 'Déchets du raffinage du pétrole',
    '6': 'Déchets des procédés chimiques minéraux',
    '7': 'Déchets des procédés chimiques organiques',
    '8': 'Déchets de la fabrication de revêtements, colles',
    '9': 'Déchets des industries photographiques',
    '10': 'Déchets de procédés thermiques',
    '11': 'Déchets du traitement chimique de surface',
    '12': 'Déchets de la mise en forme des métaux',
    '13': 'Huiles usagées et combustibles liquides',
    '14': 'Solvants organiques usagés',
    '15': 'Emballages et déchets absorbants',
    '16': 'Déchets non spécifiés ailleurs',
    '17': 'Déchets de construction et démolition',
    '18': 'Déchets provenant des soins médicaux',
    '19': 'Déchets provenant des installations de traitement',
    '20': 'Déchets municipaux et assimilés',
}

CLASSE_LABELS = {
    'MA': ('Ménagers et Assimilés', 'نفايات منزلية'),
    'I': ('Inertes', 'نفايات خاملة'),
    'S': ('Spéciaux', 'نفايات خاصة'),
    'SD': ('Spéciaux Dangereux', 'نفايات خاصة خطرة'),
}

# ═══════════════════════════════════════════════════════════════════════════════
# ANNEXE II — Déchets non dangereux (MA / I)
# ═══════════════════════════════════════════════════════════════════════════════

NOMENCLATURE_DATA = [
    # Famille 01 — Déchets de l'exploration et extraction minière (Annexe II)
    {'code': '1.3.1', 'famille': '1', 'nom_fr': 'Déchets de graviers et débris de pierres', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '1.3.2', 'famille': '1', 'nom_fr': 'Déchets de sable et d\'argile', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '1.3.3', 'famille': '1', 'nom_fr': 'Déchets provenant de la taille et du sciage des pierres', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '1.3.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '1.4.1', 'famille': '1', 'nom_fr': 'Boues et autres déchets de forage contenant de l\'eau douce', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '1.4.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},

    # Famille 02 — Déchets agricoles et de la préparation alimentaire (Annexe II)
    {'code': '2.1.1', 'famille': '2', 'nom_fr': 'Déchets de tissus végétaux', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.1.2', 'famille': '2', 'nom_fr': 'Déchets de matières plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.1.99', 'famille': '2', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.4.1', 'famille': '2', 'nom_fr': 'Terre provenant du lavage et du nettoyage des betteraves', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.4.99', 'famille': '2', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.7.1', 'famille': '2', 'nom_fr': 'Déchets provenant du lavage, du nettoyage et de la réduction mécanique des matières premières', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.7.2', 'famille': '2', 'nom_fr': 'Matières impropres à la consommation ou à la transformation', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '2.7.99', 'famille': '2', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 03 — Déchets du bois et du papier (Annexe II)
    {'code': '3.1.1', 'famille': '3', 'nom_fr': 'Déchets d\'écorce et de liège', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.1.2', 'famille': '3', 'nom_fr': 'Sciure de bois, copeaux, chutes, bois, panneaux de particules et placages', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.1.99', 'famille': '3', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.3.1', 'famille': '3', 'nom_fr': 'Déchets d\'écorce et de bois', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.3.2', 'famille': '3', 'nom_fr': 'Refus séparés mécaniquement provenant du broyage de déchets de papier et de carton', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.3.3', 'famille': '3', 'nom_fr': 'Déchets provenant du tri de papier et de carton destinés au recyclage', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '3.3.99', 'famille': '3', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 04 — Déchets du cuir, de la fourrure et du textile (Annexe II)
    {'code': '4.2.1', 'famille': '4', 'nom_fr': 'Déchets provenant des finitions', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '4.2.2', 'famille': '4', 'nom_fr': 'Fibres textiles non ouvrées', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '4.2.3', 'famille': '4', 'nom_fr': 'Fibres textiles ouvrées', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '4.2.99', 'famille': '4', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 07 — Déchets des procédés chimiques organiques (Annexe II)
    {'code': '7.2.1', 'famille': '7', 'nom_fr': 'Déchets plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '7.2.99', 'famille': '7', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 10 — Déchets de procédés thermiques (Annexe II)
    {'code': '10.12.1', 'famille': '10', 'nom_fr': 'Déchets de préparation avant cuisson', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '10.12.2', 'famille': '10', 'nom_fr': 'Moules déclassés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '10.12.3', 'famille': '10', 'nom_fr': 'Déchets de produits en céramique, briques, carrelage et matériaux de construction après cuisson', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '10.12.99', 'famille': '10', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '10.13.1', 'famille': '10', 'nom_fr': 'Déchets et boues de béton', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '10.13.99', 'famille': '10', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},

    # Famille 12 — Déchets de la mise en forme des métaux (Annexe II)
    {'code': '12.1.1', 'famille': '12', 'nom_fr': 'Déchets de matières plastiques d\'ébarbage et de tournage', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '12.1.99', 'famille': '12', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 15 — Emballages et déchets absorbants (Annexe II)
    {'code': '15.1.1', 'famille': '15', 'nom_fr': 'Emballages en papier/carton', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.2', 'famille': '15', 'nom_fr': 'Emballages en matières plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.3', 'famille': '15', 'nom_fr': 'Emballages en bois', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.4', 'famille': '15', 'nom_fr': 'Emballages métalliques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.5', 'famille': '15', 'nom_fr': 'Emballages composites', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.6', 'famille': '15', 'nom_fr': 'Emballages en mélange', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.7', 'famille': '15', 'nom_fr': 'Emballages en verre', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.8', 'famille': '15', 'nom_fr': 'Emballages textiles', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '15.1.99', 'famille': '15', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 16 — Déchets non spécifiés ailleurs (Annexe II)
    {'code': '16.1.1', 'famille': '16', 'nom_fr': 'Matières plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '16.1.2', 'famille': '16', 'nom_fr': 'Verre', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '16.1.99', 'famille': '16', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 17 — Déchets de construction et démolition (Annexe II)
    {'code': '17.1.1', 'famille': '17', 'nom_fr': 'Béton', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.1.2', 'famille': '17', 'nom_fr': 'Briques', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.1.3', 'famille': '17', 'nom_fr': 'Tuiles et céramiques', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.1.4', 'famille': '17', 'nom_fr': 'Mélanges de béton, brique, tuiles et céramiques', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.1.99', 'famille': '17', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.2.1', 'famille': '17', 'nom_fr': 'Bois', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.2.2', 'famille': '17', 'nom_fr': 'Verre', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.2.3', 'famille': '17', 'nom_fr': 'Matières plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.2.99', 'famille': '17', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.7.1', 'famille': '17', 'nom_fr': 'Matériaux de construction à base de gypse', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.7.99', 'famille': '17', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.8.1', 'famille': '17', 'nom_fr': 'Déchets de construction et de démolition en mélange', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '17.8.99', 'famille': '17', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},

    # Famille 19 — Déchets provenant des installations de traitement (Annexe II)
    {'code': '19.4.1', 'famille': '19', 'nom_fr': 'Déchets vitrifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.4.99', 'famille': '19', 'nom_fr': 'Déchets non spécifiés', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.5.1', 'famille': '19', 'nom_fr': 'Fraction non compostée des déchets communaux et assimilés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.5.2', 'famille': '19', 'nom_fr': 'Compost déclassé', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.5.99', 'famille': '19', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.1', 'famille': '19', 'nom_fr': 'Papier et carton', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.2', 'famille': '19', 'nom_fr': 'Verre', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.3', 'famille': '19', 'nom_fr': 'Bois', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.4', 'famille': '19', 'nom_fr': 'Textiles', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.5', 'famille': '19', 'nom_fr': 'Minéraux (par exemple, sable, cailloux)', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '19.12.99', 'famille': '19', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # Famille 20 — Déchets municipaux et assimilés (Annexe II)
    {'code': '20.1.1', 'famille': '20', 'nom_fr': 'Papier et carton', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.2', 'famille': '20', 'nom_fr': 'Verre', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.3', 'famille': '20', 'nom_fr': 'Déchets de cuisine et de cantine biodégradables', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.4', 'famille': '20', 'nom_fr': 'Vêtements', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.5', 'famille': '20', 'nom_fr': 'Textiles', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.6', 'famille': '20', 'nom_fr': 'Bois', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.7', 'famille': '20', 'nom_fr': 'Matières plastiques', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.1.99', 'famille': '20', 'nom_fr': 'Autres fractions non spécifiées', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.2.1', 'famille': '20', 'nom_fr': 'Déchets biodégradables', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.2.2', 'famille': '20', 'nom_fr': 'Terres et pierres', 'classe': 'I', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.2.3', 'famille': '20', 'nom_fr': 'Déchets non biodégradables', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.2.99', 'famille': '20', 'nom_fr': 'Déchets non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.3.1', 'famille': '20', 'nom_fr': 'Déchets communaux en mélange', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.3.2', 'famille': '20', 'nom_fr': 'Déchets de marchés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.3.3', 'famille': '20', 'nom_fr': 'Déchets de nettoyage des rues', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},
    {'code': '20.3.99', 'famille': '20', 'nom_fr': 'Déchets communaux non spécifiés', 'classe': 'MA', 'danger_fr': '', 'annexe': 'II'},

    # ═══════════════════════════════════════════════════════════════════════════════
    # ANNEXE III — Déchets spéciaux et dangereux (S / SD)
    # ═══════════════════════════════════════════════════════════════════════════════

    # Famille 01 (Annexe III)
    {'code': '1.1.1', 'famille': '1', 'nom_fr': 'Déchets provenant de l\'extraction des minéraux métallifères', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.1.2', 'famille': '1', 'nom_fr': 'Déchets provenant de l\'extraction des minéraux non métallifères', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.1.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.2.1', 'famille': '1', 'nom_fr': 'Stériles acidogènes provenant de la transformation du sulfure', 'classe': 'SD', 'danger_fr': 'Comburante\nIrritante', 'annexe': 'III'},
    {'code': '1.2.2', 'famille': '1', 'nom_fr': 'Autres stériles contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '1.2.3', 'famille': '1', 'nom_fr': 'Stériles autres que ceux visés aux rubriques 1.2.1 et 1.2.2', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.2.4', 'famille': '1', 'nom_fr': 'Autres déchets contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '1.2.5', 'famille': '1', 'nom_fr': 'Déchets de poussières et de poudres', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.2.6', 'famille': '1', 'nom_fr': 'Boues rouges issues de la production d\'alumine', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.2.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.3.1', 'famille': '1', 'nom_fr': 'Déchets contenant des substances dangereuses provenant de la transformation des minéraux non métallifères', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '1.3.2', 'famille': '1', 'nom_fr': 'Déchets de poussières et de poudres', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.3.3', 'famille': '1', 'nom_fr': 'Déchets de la transformation de la potasse et des sels minéraux', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.3.4', 'famille': '1', 'nom_fr': 'Stériles et autres déchets provenant du lavage et du nettoyage des minéraux', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.3.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.4.1', 'famille': '1', 'nom_fr': 'Boues et autres déchets de forage contenant des hydrocarbures', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique', 'annexe': 'III'},
    {'code': '1.4.2', 'famille': '1', 'nom_fr': 'Boues et autres déchets de forage contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '1.4.3', 'famille': '1', 'nom_fr': 'Boues et autres déchets de forage contenant des sels de baryum', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.4.4', 'famille': '1', 'nom_fr': 'Boues et autres déchets de forage contenant des chlorures', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},
    {'code': '1.4.99', 'famille': '1', 'nom_fr': 'Déchets non spécifiés', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},

    # Famille 02 (Annexe III)
    {'code': '2.1.5', 'famille': '2', 'nom_fr': 'Déchets agrochimiques contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '2.1.6', 'famille': '2', 'nom_fr': 'Déchets agrochimiques autres que ceux visés à la rubrique 2.1.5', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},

    # Famille 03 (Annexe III)
    {'code': '3.2.1', 'famille': '3', 'nom_fr': 'Composés organiques non halogénés de protection du bois', 'classe': 'SD', 'danger_fr': 'Comburante\nInflammable', 'annexe': 'III'},
    {'code': '3.2.2', 'famille': '3', 'nom_fr': 'Composés organochlorés de protection du bois', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '3.2.3', 'famille': '3', 'nom_fr': 'Composés organométalliques de protection du bois', 'classe': 'SD', 'danger_fr': 'Nocive\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '3.2.4', 'famille': '3', 'nom_fr': 'Composés inorganiques de protection du bois', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '3.2.5', 'famille': '3', 'nom_fr': 'Autres produits de protection du bois contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '3.2.99', 'famille': '3', 'nom_fr': 'Produits de protection du bois non spécifiés', 'classe': 'S', 'danger_fr': '', 'annexe': 'III'},

    # Famille 04 (Annexe III)
    {'code': '4.1.3', 'famille': '4', 'nom_fr': 'Déchets de dégraissage contenant des solvants sans phase liquide', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique', 'annexe': 'III'},
    {'code': '4.1.4', 'famille': '4', 'nom_fr': 'Liqueur de tannage contenant du chrome', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '4.1.6', 'famille': '4', 'nom_fr': 'Boues provenant du traitement in situ des effluents, contenant du chrome', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '4.1.9', 'famille': '4', 'nom_fr': 'Déchets de cuir tanné contenant du chrome', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '4.2.3', 'famille': '4', 'nom_fr': 'Déchets provenant des finitions contenant des solvants organiques', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique', 'annexe': 'III'},
    {'code': '4.2.4', 'famille': '4', 'nom_fr': 'Teintures et pigments contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '4.2.6', 'famille': '4', 'nom_fr': 'Boues provenant du traitement in situ des effluents contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},

    # Famille 05 (Annexe III)
    {'code': '5.1.1', 'famille': '5', 'nom_fr': 'Boues de dessalage', 'classe': 'SD', 'danger_fr': 'Irritante', 'annexe': 'III'},
    {'code': '5.1.2', 'famille': '5', 'nom_fr': 'Boues de fond de cuves', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '5.1.3', 'famille': '5', 'nom_fr': 'Boues d\'alkyles acides', 'classe': 'SD', 'danger_fr': 'Facilement inflammable\nToxique\nCorrosive', 'annexe': 'III'},
    {'code': '5.1.4', 'famille': '5', 'nom_fr': 'Hydrocarbures accidentellement répandus', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène\nMutagène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '5.1.6', 'famille': '5', 'nom_fr': 'Goudrons acides', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène\nMutagène', 'annexe': 'III'},
    {'code': '5.1.7', 'famille': '5', 'nom_fr': 'Autres goudrons et bitumes', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène\nMutagène', 'annexe': 'III'},
    {'code': '5.2.1', 'famille': '5', 'nom_fr': 'Goudrons acides', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène\nMutagène', 'annexe': 'III'},
    {'code': '5.3.1', 'famille': '5', 'nom_fr': 'Déchets contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},

    # Famille 06 (Annexe III)
    {'code': '6.1.1', 'famille': '6', 'nom_fr': 'Acide sulfurique et acide sulfureux', 'classe': 'SD', 'danger_fr': 'Comburante\nInflammable\nToxique\nCorrosive\nIrritante', 'annexe': 'III'},
    {'code': '6.1.2', 'famille': '6', 'nom_fr': 'Acide chlorhydrique', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCorrosive\nIrritante', 'annexe': 'III'},
    {'code': '6.1.3', 'famille': '6', 'nom_fr': 'Acide fluorhydrique', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCorrosive\nIrritante', 'annexe': 'III'},
    {'code': '6.1.4', 'famille': '6', 'nom_fr': 'Acide phosphorique et acide phosphoreux', 'classe': 'SD', 'danger_fr': 'Explosive\nToxique', 'annexe': 'III'},
    {'code': '6.1.5', 'famille': '6', 'nom_fr': 'Acide nitrique et acide nitreux', 'classe': 'SD', 'danger_fr': 'Explosive\nToxique', 'annexe': 'III'},
    {'code': '6.1.6', 'famille': '6', 'nom_fr': 'Autres acides', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.2.1', 'famille': '6', 'nom_fr': 'Hydroxyde de calcium', 'classe': 'SD', 'danger_fr': 'Nocive', 'annexe': 'III'},
    {'code': '6.2.2', 'famille': '6', 'nom_fr': 'Hydroxyde d\'ammonium', 'classe': 'SD', 'danger_fr': 'Nocive\nComburante', 'annexe': 'III'},
    {'code': '6.2.3', 'famille': '6', 'nom_fr': 'Hydroxyde de sodium et hydroxyde de potassium', 'classe': 'SD', 'danger_fr': 'Explosible', 'annexe': 'III'},
    {'code': '6.3.1', 'famille': '6', 'nom_fr': 'Sels solides et solutions contenant des cyanures', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.3.2', 'famille': '6', 'nom_fr': 'Sels solides et solutions contenant des métaux lourds', 'classe': 'SD', 'danger_fr': 'Nocive\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.4.1', 'famille': '6', 'nom_fr': 'Déchets contenant de l\'arsenic', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.4.2', 'famille': '6', 'nom_fr': 'Déchets contenant du mercure', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.4.3', 'famille': '6', 'nom_fr': 'Déchets contenant d\'autres métaux lourds', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.6.1', 'famille': '6', 'nom_fr': 'Déchets contenant des sulfures dangereux', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique', 'annexe': 'III'},
    {'code': '6.7.2', 'famille': '6', 'nom_fr': 'Déchets de charbon actif utilisé pour la production du chlore', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},
    {'code': '6.7.3', 'famille': '6', 'nom_fr': 'Boues de sulfate de baryum contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.9.2', 'famille': '6', 'nom_fr': 'Déchets de réactions basées sur le calcium contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Corrosive\nIrritante', 'annexe': 'III'},
    {'code': '6.10.1', 'famille': '6', 'nom_fr': 'Déchets contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.12.1', 'famille': '6', 'nom_fr': 'Produits phytosanitaires inorganiques, agents de protection du bois et autres biocides', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '6.12.4', 'famille': '6', 'nom_fr': 'Déchets provenant de la transformation de l\'amiante', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},

    # Famille 07 (Annexe III)
    {'code': '7.1.2', 'famille': '7', 'nom_fr': 'Solvants, liquides de lavage et liqueurs mères organiques halogénés', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène', 'annexe': 'III'},
    {'code': '7.1.4', 'famille': '7', 'nom_fr': 'Résidus de réaction et résidus de distillation halogénés', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},

    # Famille 08 (Annexe III)
    {'code': '8.1.1', 'famille': '8', 'nom_fr': 'Déchets de peintures et vernis contenant des solvants organiques ou d\'autres substances dangereuses', 'classe': 'SD', 'danger_fr': 'Inflammable\nIrritante\nToxique\nDangereuse pour l\'environnement', 'annexe': 'III'},

    # Famille 09 (Annexe III)
    {'code': '9.1.1', 'famille': '9', 'nom_fr': 'Bains de développement aqueux contenant un activateur', 'classe': 'SD', 'danger_fr': 'Irritante\nNocive', 'annexe': 'III'},
    {'code': '9.1.4', 'famille': '9', 'nom_fr': 'Bains de fixation', 'classe': 'SD', 'danger_fr': 'Nocive', 'annexe': 'III'},
    {'code': '9.1.5', 'famille': '9', 'nom_fr': 'Bains de blanchiment et bains de blanchiment/fixation', 'classe': 'SD', 'danger_fr': 'Irritante\nNocive', 'annexe': 'III'},

    # Famille 10 (Annexe III)
    {'code': '10.1.4', 'famille': '10', 'nom_fr': 'Cendres volantes et cendres sous chaudière d\'hydrocarbures', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique', 'annexe': 'III'},
    {'code': '10.1.8', 'famille': '10', 'nom_fr': 'Acide sulfurique', 'classe': 'SD', 'danger_fr': 'Inflammable\nIrritante\nToxique\nCorrosive', 'annexe': 'III'},

    # Famille 13 — Huiles usagées et combustibles liquides (Annexe III)
    {'code': '13.1.1', 'famille': '13', 'nom_fr': 'Huiles hydrauliques contenant des PCB', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '13.2.1', 'famille': '13', 'nom_fr': 'Huile moteur, de boîte de vitesses et de lubrification chlorées à base minérale', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '13.3.1', 'famille': '13', 'nom_fr': 'Huiles isolantes et fluides caloporteurs contenant des PCB', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '13.6.1', 'famille': '13', 'nom_fr': 'Fuel, oil et diesel', 'classe': 'SD', 'danger_fr': 'Inflammable\nNocive', 'annexe': 'III'},
    {'code': '13.6.2', 'famille': '13', 'nom_fr': 'Essence', 'classe': 'SD', 'danger_fr': 'Inflammable\nNocive', 'annexe': 'III'},

    # Famille 14 — Solvants organiques usagés (Annexe III)
    {'code': '14.1.1', 'famille': '14', 'nom_fr': 'Chlorofluorocarbones, HCFC, HFC', 'classe': 'SD', 'danger_fr': 'Comburante\nInflammable', 'annexe': 'III'},
    {'code': '14.1.2', 'famille': '14', 'nom_fr': 'Autres solvants et mélanges de solvants halogénés', 'classe': 'SD', 'danger_fr': 'Comburante\nInflammable\nToxique', 'annexe': 'III'},
    {'code': '14.1.3', 'famille': '14', 'nom_fr': 'Autres solvants et mélanges de solvants', 'classe': 'SD', 'danger_fr': 'Toxique vis-à-vis de la reproduction\nInflammable\nToxique', 'annexe': 'III'},

    # Famille 15 (Annexe III)
    {'code': '15.1.1', 'famille': '15', 'nom_fr': 'Emballages contenant des résidus de substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '15.2.1', 'famille': '15', 'nom_fr': 'Absorbants, matériaux filtrants, chiffons d\'essuyage et vêtements de protection contaminés par des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Inflammable\nIrritante', 'annexe': 'III'},

    # Famille 16 (Annexe III)
    {'code': '16.1.4', 'famille': '16', 'nom_fr': 'Filtres à huile', 'classe': 'SD', 'danger_fr': 'Nocive', 'annexe': 'III'},
    {'code': '16.1.5', 'famille': '16', 'nom_fr': 'Composants contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.1.6', 'famille': '16', 'nom_fr': 'Composants contenant des PCB', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.1.7', 'famille': '16', 'nom_fr': 'Composants explosifs (par exemple, coussins gonflables de sécurité)', 'classe': 'SD', 'danger_fr': 'Explosible\nComburante\nInflammable', 'annexe': 'III'},
    {'code': '16.1.8', 'famille': '16', 'nom_fr': 'Patins de freins contenant de l\'amiante', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},
    {'code': '16.2.1', 'famille': '16', 'nom_fr': 'Transformateurs et accumulateurs contenant des PCB', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.4.1', 'famille': '16', 'nom_fr': 'Déchets de munitions', 'classe': 'SD', 'danger_fr': 'Explosible\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.5.1', 'famille': '16', 'nom_fr': 'Gaz en récipients à pression contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.5.3', 'famille': '16', 'nom_fr': 'Produits chimiques de laboratoire contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.6.1', 'famille': '16', 'nom_fr': 'Accumulateurs au plomb', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '16.6.2', 'famille': '16', 'nom_fr': 'Accumulateurs Ni-Cd', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '16.6.3', 'famille': '16', 'nom_fr': 'Piles contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '16.9.1', 'famille': '16', 'nom_fr': 'Permanganates, par exemple, permanganate de potassium', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '16.9.2', 'famille': '16', 'nom_fr': 'Chromates, par exemple, chromate de potassium', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '16.9.3', 'famille': '16', 'nom_fr': 'Peroxydes, par exemple, peroxyde d\'hydrogène', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},

    # Famille 17 (Annexe III)
    {'code': '17.3.1', 'famille': '17', 'nom_fr': 'Mélanges bitumineux contenant du goudron', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène\nMutagène', 'annexe': 'III'},
    {'code': '17.3.3', 'famille': '17', 'nom_fr': 'Goudron et produits goudronnés', 'classe': 'SD', 'danger_fr': 'Inflammable\nToxique\nCancérogène\nMutagène', 'annexe': 'III'},
    {'code': '17.5.1', 'famille': '17', 'nom_fr': 'Terres et cailloux contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '17.5.3', 'famille': '17', 'nom_fr': 'Boues de dragage contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '17.6.1', 'famille': '17', 'nom_fr': 'Matériaux d\'isolation contenant de l\'amiante', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},
    {'code': '17.6.4', 'famille': '17', 'nom_fr': 'Matériaux de construction contenant de l\'amiante', 'classe': 'SD', 'danger_fr': 'Dangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '17.8.1', 'famille': '17', 'nom_fr': 'Déchets de construction et de démolition contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '17.8.2', 'famille': '17', 'nom_fr': 'Déchets de construction et de démolition contenant des PCB', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique\nCancérogène\nDangereuse pour l\'environnement', 'annexe': 'III'},

    # Famille 18 — Déchets provenant des soins médicaux (Annexe III)
    {'code': '18.1.1', 'famille': '18', 'nom_fr': 'Déchets piquants, coupants et tranchants', 'classe': 'SD', 'danger_fr': 'Infectieuse', 'annexe': 'III'},
    {'code': '18.1.3', 'famille': '18', 'nom_fr': 'Déchets dont la collecte et l\'élimination font l\'objet de prescriptions particulières vis-à-vis des risques d\'infection', 'classe': 'SD', 'danger_fr': 'Toxique\nInfectieuse', 'annexe': 'III'},
    {'code': '18.1.5', 'famille': '18', 'nom_fr': 'Produits chimiques à base de ou contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},
    {'code': '18.1.7', 'famille': '18', 'nom_fr': 'Médicaments cytotoxiques et cytostatiques', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},
    {'code': '18.1.9', 'famille': '18', 'nom_fr': 'Déchets d\'amalgame dentaire', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},

    # Famille 19 (Annexe III)
    {'code': '19.1.2', 'famille': '19', 'nom_fr': 'Gâteau de filtration provenant de l\'épuration des fumées', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique', 'annexe': 'III'},
    {'code': '19.7.1', 'famille': '19', 'nom_fr': 'Lixiviats des centres d\'enfouissement techniques et des décharges contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Toxique', 'annexe': 'III'},

    # Famille 20 (Annexe III)
    {'code': '20.1.1', 'famille': '20', 'nom_fr': 'Solvants', 'classe': 'SD', 'danger_fr': 'Inflammable\nIrritante', 'annexe': 'III'},
    {'code': '20.1.2', 'famille': '20', 'nom_fr': 'Acides', 'classe': 'SD', 'danger_fr': 'Inflammable\nIrritante\nToxique', 'annexe': 'III'},
    {'code': '20.1.3', 'famille': '20', 'nom_fr': 'Déchets basiques', 'classe': 'SD', 'danger_fr': 'Irritante\nToxique', 'annexe': 'III'},
    {'code': '20.1.5', 'famille': '20', 'nom_fr': 'Pesticides', 'classe': 'SD', 'danger_fr': 'Toxique\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '20.1.6', 'famille': '20', 'nom_fr': 'Tubes fluorescents et autres déchets contenant du mercure', 'classe': 'SD', 'danger_fr': 'Toxique\nToxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '20.1.10', 'famille': '20', 'nom_fr': 'Peintures, encres, colles et résines contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Inflammable\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '20.1.14', 'famille': '20', 'nom_fr': 'Médicaments cytotoxiques et cytostatiques', 'classe': 'SD', 'danger_fr': 'Toxique\nCancérogène', 'annexe': 'III'},
    {'code': '20.1.16', 'famille': '20', 'nom_fr': 'Piles et accumulateurs dangereux', 'classe': 'SD', 'danger_fr': 'Toxique vis-à-vis de la reproduction\nDangereuse pour l\'environnement', 'annexe': 'III'},
    {'code': '20.1.20', 'famille': '20', 'nom_fr': 'Bois contenant des substances dangereuses', 'classe': 'SD', 'danger_fr': 'Comburante\nDangereuse pour l\'environnement', 'annexe': 'III'},
]


def rechercher_par_code(code):
    """Recherche dans la nomenclature par code exact. Retourne une liste (plusieurs entrées possibles pour un même code, ex: 1.3.1)."""
    return [item for item in NOMENCLATURE_DATA if item['code'] == code]


def rechercher_par_texte(texte):
    """Recherche dans la nomenclature par texte (code, désignation, dangerosité)."""
    texte = texte.lower().strip()
    results = []
    for item in NOMENCLATURE_DATA:
        if (texte in item['code'].lower()
                or texte in item['nom_fr'].lower()
                or texte in (item.get('danger_fr', '') or '').lower()):
            results.append(item)
    return results


def inferer_bsd_agrement(classe):
    """Infère les obligations BSD et agrément selon la classe du déchet."""
    if classe == 'SD':
        return True, True
    elif classe == 'S':
        return True, False
    else:
        return False, False
