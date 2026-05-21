import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'fr' | 'es';

export interface GameTranslation {
  title: string;
  goal: string;
  steps: string[];
}

export interface AppTranslations {
  cancel: string;
  ok: string;

  heroTitle: string;
  heroSubtitle: string;
  howToPlayLink: string;
  imagesNeeded: (n: number) => string;
  fillWithDefaults: string;
  resetAll: string;
  autoSaveError: string;
  deleteAllImages: string;
  yesDelete: string;
  generateCards: (n: number) => string;
  reshuffleCards: string;
  footer: string;

  imagesPerCard: string;

  width: string;
  height: string;
  marginVertical: string;
  marginHorizontal: string;
  background: string;
  browsePng: string;
  remove: string;
  preview: string;

  exportImages: string;
  exporting: string;

  editImage: string;
  noImageSelected: string;
  zoom: string;
  rotate: string;
  browseImage: string;
  removeImage: string;

  howToPlayPageTitle: string;
  howToPlayLead: string;
  goldenRuleTitle: string;
  goldenRuleText: string;
  fiveMiniGamesTitle: string;
  fiveMiniGamesIntro: string;
  goalLabel: string;
  games: GameTranslation[];
  createYourDeck: string;
}

const en: AppTranslations = {
  cancel: 'Cancel',
  ok: 'OK',

  heroTitle: 'Dobble Card Creator',
  heroSubtitle: 'Upload your own images, generate a custom card deck, and export it print-ready in seconds.',
  howToPlayLink: 'How to play Dobble?',
  imagesNeeded: (n) => `Images — ${n} needed`,
  fillWithDefaults: 'Fill with defaults',
  resetAll: 'Reset all',
  autoSaveError: 'Auto-save failed — your changes may not be preserved after a page refresh.',
  deleteAllImages: 'Delete all images?',
  yesDelete: 'Yes, delete',
  generateCards: (n) => `Generate the ${n} Cards`,
  reshuffleCards: 'Reshuffle all the cards',
  footer: 'Fair use license © 2026 R. Deleuze',

  imagesPerCard: 'Number of images per card',

  width: 'Width',
  height: 'Height',
  marginVertical: 'Margin vertical',
  marginHorizontal: 'Margin horizontal',
  background: 'Background',
  browsePng: 'Browse PNG',
  remove: 'Remove',
  preview: 'Preview',

  exportImages: 'Export Images',
  exporting: 'Exporting…',

  editImage: 'Edit Image',
  noImageSelected: 'No image selected',
  zoom: 'Zoom',
  rotate: 'Rotate',
  browseImage: 'Browse image',
  removeImage: 'Remove image',

  howToPlayPageTitle: 'How to Play Dobble',
  howToPlayLead: 'Dobble is a fast-paced visual observation game for 2–8 players. A round lasts about 15 minutes.',
  goldenRuleTitle: 'The Golden Rule',
  goldenRuleText: 'Any two cards in the deck share exactly one matching symbol — same shape and color, but possibly a different size. This is always true, for every pair.',
  fiveMiniGamesTitle: 'Five Mini-Games',
  fiveMiniGamesIntro: 'All five mini-games share the same core mechanic — find the one matching symbol between two cards and call it out. What changes between games is the objective and how cards are won or lost.',
  goalLabel: 'Goal',
  games: [
    {
      title: 'The Tower',
      goal: 'Collect the most cards.',
      steps: [
        'Deal one card face-down to each player. Stack the rest face-up in the center.',
        'On go, everyone flips their card at the same time.',
        'Race to spot the symbol shared between your card and the top of the center pile.',
        'Call it out — take that center card and place it on top of yours.',
        'All players now compare their top card against the new center card.',
        'When the center pile runs out, the player with the most cards wins.',
      ],
    },
    {
      title: 'The Well',
      goal: 'Be the first to discard all your cards.',
      steps: [
        'Deal all the cards face-down to each player, the last one should be face-up in the center.',
        "On go, everyone races to match their top card against the center pile's top card.",
        'Call out the match — discard your card onto the center pile.',
        'First player to empty their hand wins.',
      ],
    },
    {
      title: 'Poisoned Gift',
      goal: 'End up with the fewest cards.',
      steps: [
        'Deal all cards face-down to players. Flip one to start a central discard pile.',
        "Find the symbol that matches between another player's top card and the center card.",
        'Call it out — pass your top card to that player as an unwanted "gift".',
        'When all cards are distributed, the player with the fewest cards wins.',
      ],
    },
    {
      title: 'Catch Them All',
      goal: 'Collect the most cards from the table.',
      steps: [
        'Spread several cards face-up in a ring around a draw pile in the center.',
        'Each player holds one card and races to match it against any card in the ring.',
        'Call out the match — claim that ring card and place it on your pile.',
        'Flip a new card from the draw pile to refill the ring.',
        'Most cards collected at the end wins.',
      ],
    },
    {
      title: 'Hot Potato',
      goal: 'Hold the fewest cards when the pile runs out.',
      steps: [
        'Deal one card to each player. Stack the rest face-up in the center.',
        'Find the symbol shared between your card and the top of the center pile.',
        'Call it out — pass the center card to any opponent of your choice.',
        'That player now holds two cards and must deal with both.',
        'Fewest cards in hand when the pile is empty wins.',
      ],
    },
  ],
  createYourDeck: 'Create Your Own Deck',
};

const fr: AppTranslations = {
  cancel: 'Annuler',
  ok: 'OK',

  heroTitle: 'Créateur de cartes Dobble',
  heroSubtitle: 'Importez vos propres images, générez un jeu de cartes personnalisé et exportez-le prêt à imprimer en quelques secondes.',
  howToPlayLink: 'Comment jouer à Dobble ?',
  imagesNeeded: (n) => `Images — ${n} requises`,
  fillWithDefaults: 'Remplir avec les défauts',
  resetAll: 'Tout réinitialiser',
  autoSaveError: 'La sauvegarde automatique a échoué — vos modifications peuvent ne pas être préservées après un rechargement.',
  deleteAllImages: 'Supprimer toutes les images ?',
  yesDelete: 'Oui, supprimer',
  generateCards: (n) => `Générer les ${n} cartes`,
  reshuffleCards: 'Rebattre toutes les cartes',
  footer: "Licence d'utilisation équitable © 2026 R. Deleuze",

  imagesPerCard: "Nombre d'images par carte",

  width: 'Largeur',
  height: 'Hauteur',
  marginVertical: 'Marge verticale',
  marginHorizontal: 'Marge horizontale',
  background: 'Arrière-plan',
  browsePng: 'Parcourir PNG',
  remove: 'Supprimer',
  preview: 'Aperçu',

  exportImages: 'Exporter les images',
  exporting: 'Exportation…',

  editImage: "Modifier l'image",
  noImageSelected: 'Aucune image sélectionnée',
  zoom: 'Zoom',
  rotate: 'Rotation',
  browseImage: 'Parcourir',
  removeImage: "Supprimer l'image",

  howToPlayPageTitle: 'Comment jouer à Dobble',
  howToPlayLead: "Dobble est un jeu d'observation visuelle et de rapidité pour 2 à 8 joueurs. Une partie dure environ 15 minutes.",
  goldenRuleTitle: "La règle d'or",
  goldenRuleText: "Deux cartes quelconques du paquet partagent exactement un symbole identique — même forme et couleur, mais éventuellement de taille différente. Cela est toujours vrai, pour chaque paire.",
  fiveMiniGamesTitle: 'Cinq mini-jeux',
  fiveMiniGamesIntro: "Les cinq mini-jeux partagent la même mécanique centrale — trouvez le seul symbole identique entre deux cartes et nommez-le. Ce qui change entre les jeux, c'est l'objectif et la façon dont les cartes sont gagnées ou perdues.",
  goalLabel: 'Objectif',
  games: [
    {
      title: 'La Tour',
      goal: 'Collecter le plus de cartes.',
      steps: [
        'Distribuez une carte face cachée à chaque joueur. Empilez le reste face visible au centre.',
        'Tout le monde retourne sa carte en même temps.',
        'Trouvez le symbole commun entre votre carte et celle du dessus de la pile centrale.',
        'Nommez-le — prenez cette carte centrale et posez-la sur la vôtre.',
        'Tous les joueurs comparent maintenant leur carte du dessus avec la nouvelle de la pile centrale.',
        'Quand la pile centrale est épuisée, le joueur avec le plus de cartes gagne.',
      ],
    },
    {
      title: 'Le Puits',
      goal: 'Être le premier à se débarrasser de toutes ses cartes.',
      steps: [
        'Placez une carte face visible au centre. Distribuez le reste des cartes face cachée à chaque joueur.',
        'Chaque joueur doit avoir exactement le même nombre de cartes. Les cartes restantes peuvent être placées au centre ou défaussées.',
        "Tout le monde s'empresse de faire correspondre sa carte du dessus avec celle du haut de la pile centrale.",
        'Nommez la correspondance — défaussez votre carte sur la pile centrale.',
        'Le premier joueur à vider sa main gagne.',
      ],
    },
    {
      title: 'Cadeau Empoisonné',
      goal: 'Se retrouver avec le moins de cartes.',
      steps: [
        'Distribuez toutes les cartes face cachée aux joueurs. Retournez-en une pour commencer une pile centrale.',
        "Trouvez le symbole qui correspond entre la carte du dessus d'un autre joueur et la carte centrale.",
        "Nommez-le — passez votre carte du dessus à ce joueur comme un « cadeau » indésirable.",
        'Quand toutes les cartes sont distribuées, le joueur avec le moins de cartes gagne.',
      ],
    },
    {
      title: 'Attrape-les Tous',
      goal: 'Collecter le plus de cartes sur la table.',
      steps: [
        "Étalez plusieurs cartes face visible en anneau autour d'une pioche centrale.",
        "Chaque joueur tient une carte et s'empresse de la faire correspondre avec n'importe quelle carte de l'anneau.",
        "Nommez la correspondance — prenez cette carte de l'anneau et placez-la sur votre pile.",
        "Retournez une nouvelle carte de la pioche pour remplir à nouveau l'anneau.",
        'Celui qui a collecté le plus de cartes à la fin gagne.',
      ],
    },
    {
      title: 'Patate Chaude',
      goal: 'Avoir le moins de cartes quand la pile est épuisée.',
      steps: [
        'Distribuez une carte à chaque joueur. Empilez le reste face visible au centre.',
        'Trouvez le symbole commun entre votre carte et le dessus de la pile centrale.',
        "Nommez-le — passez la carte centrale à n'importe quel adversaire de votre choix.",
        "Ce joueur tient maintenant deux cartes et doit s'en occuper.",
        'Celui qui a le moins de cartes en main quand la pile est vide gagne.',
      ],
    },
  ],
  createYourDeck: 'Créer votre propre jeu',
};

const es: AppTranslations = {
  cancel: 'Cancelar',
  ok: 'OK',

  heroTitle: 'Creador de cartas Dobble',
  heroSubtitle: 'Sube tus propias imágenes, genera un mazo de cartas personalizado y expórtalo listo para imprimir en segundos.',
  howToPlayLink: '¿Cómo jugar a Dobble?',
  imagesNeeded: (n) => `Imágenes — ${n} necesarias`,
  fillWithDefaults: 'Rellenar con valores predeterminados',
  resetAll: 'Restablecer todo',
  autoSaveError: 'El guardado automático falló — es posible que los cambios no se conserven al recargar la página.',
  deleteAllImages: '¿Eliminar todas las imágenes?',
  yesDelete: 'Sí, eliminar',
  generateCards: (n) => `Generar las ${n} cartas`,
  reshuffleCards: 'Mezclar todas las cartas',
  footer: 'Licencia de uso justo © 2026 R. Deleuze',

  imagesPerCard: 'Número de imágenes por carta',

  width: 'Ancho',
  height: 'Alto',
  marginVertical: 'Margen vertical',
  marginHorizontal: 'Margen horizontal',
  background: 'Fondo',
  browsePng: 'Buscar PNG',
  remove: 'Eliminar',
  preview: 'Vista previa',

  exportImages: 'Exportar imágenes',
  exporting: 'Exportando…',

  editImage: 'Editar imagen',
  noImageSelected: 'Ninguna imagen seleccionada',
  zoom: 'Zoom',
  rotate: 'Rotación',
  browseImage: 'Buscar imagen',
  removeImage: 'Eliminar imagen',

  howToPlayPageTitle: 'Cómo jugar a Dobble',
  howToPlayLead: 'Dobble es un juego de observación visual rápido para 2 a 8 jugadores. Una partida dura unos 15 minutos.',
  goldenRuleTitle: 'La regla de oro',
  goldenRuleText: 'Cualesquiera dos cartas del mazo comparten exactamente un símbolo idéntico — posiblemente de distinto tamaño. Esto es siempre cierto, para cada par.',
  fiveMiniGamesTitle: 'Cinco minijuegos',
  fiveMiniGamesIntro: 'Los cinco minijuegos comparten la misma mecánica central — encuentra el único símbolo idéntico entre dos cartas y nómbralo. Lo que cambia entre los juegos es el objetivo y cómo se ganan o pierden las cartas.',
  goalLabel: 'Objetivo',
  games: [
    {
      title: 'La Torre',
      goal: 'Recoger el mayor número de cartas.',
      steps: [
        'Reparte una carta boca abajo a cada jugador. Apila el resto boca arriba en el centro.',
        'Todos voltean su carta al mismo tiempo.',
        'Encuentra el símbolo compartido entre tu carta y la carta superior de la pila central.',
        'Nómbralo — toma esa carta central y colócala sobre la tuya.',
        'Todos los jugadores comparan ahora su carta con la nueva carta de la pila central.',
        'Cuando se agote la pila central, gana el jugador con más cartas.',
      ],
    },
    {
      title: 'El Pozo',
      goal: 'Ser el primero en deshacerse de todas tus cartas.',
      steps: [
        'Apila una carta boca arriba en el centro. Reparte el resto de las cartas boca abajo a cada jugador.',
        'Cada jugador debería tener exactamente la misma cantidad de cartas. Las cartas sobrantes pueden colocarse en el centro o descartarse.',
        'Todos compiten por hacer coincidir su carta superior con la carta superior de la pila central.',
        'Nombra la coincidencia — descarta tu carta en la pila central.',
        'El primer jugador en vaciar su mano gana.',
      ],
    },
    {
      title: 'Regalo Envenenado',
      goal: 'Terminar con el menor número de cartas.',
      steps: [
        'Reparte todas las cartas boca abajo a los jugadores. Voltea una para comenzar una pila central.',
        'Encuentra el símbolo que coincide entre la carta superior de otro jugador y la carta central.',
        'Nómbralo — pasa tu carta superior a ese jugador como un "regalo" no deseado.',
        'Cuando todas las cartas están repartidas, gana el jugador con menos cartas.',
      ],
    },
    {
      title: 'Atrapa a Todos',
      goal: 'Recoger el mayor número de cartas de la mesa.',
      steps: [
        'Extiende varias cartas boca arriba en un anillo alrededor de un mazo central.',
        'Cada jugador sostiene una carta y compite por hacerla coincidir con cualquier carta del anillo.',
        'Nombra la coincidencia — toma esa carta del anillo y colócala en tu pila.',
        'Voltea una nueva carta del mazo para rellenar el anillo.',
        'Gana quien haya recogido más cartas al final.',
      ],
    },
    {
      title: 'Papa Caliente',
      goal: 'Tener el menor número de cartas cuando se acabe la pila.',
      steps: [
        'Reparte una carta a cada jugador. Apila el resto boca arriba en el centro.',
        'Encuentra el símbolo compartido entre tu carta y la parte superior de la pila central.',
        'Nómbralo — pasa la carta central a cualquier oponente de tu elección.',
        'Ese jugador ahora tiene dos cartas y debe manejar ambas.',
        'Gana quien tenga menos cartas en la mano cuando la pila esté vacía.',
      ],
    },
  ],
  createYourDeck: 'Crea tu propio mazo',
};

const TRANSLATIONS: Record<Language, AppTranslations> = { en, fr, es };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'dobble_language';

  readonly language = signal<Language>(this.loadLanguage());
  readonly t = computed(() => TRANSLATIONS[this.language()]);

  setLanguage(lang: Language): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.language.set(lang);
  }

  private loadLanguage(): Language {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'fr' || saved === 'es') return saved;
    return 'en';
  }
}
