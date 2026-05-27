import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'fr' | 'es';

export interface GameTranslation {
  title: string;
  goal: string;
  steps: string[];
  extra_steps?: string[];
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
  cardGenerationError: string;
  footer: string;

  imagesPerCard: string;

  width: string;
  height: string;
  diameter: string;
  margin: string;
  marginVertical: string;
  marginHorizontal: string;
  background: string;
  browsePng: string;
  remove: string;
  preview: string;

  exportPng: string;
  exportPdf: string;
  exportingPng: string;
  exportingPdf: string;
  exportInstructions: string;
  exportingInstructions: string;
  exportFailed: string;
  printHintLabel: string;
  printHintDisclaimer: string;

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
  extraStepsLabel: string;
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
  fillWithDefaults: 'Fill with default',
  resetAll: 'Reset all',
  autoSaveError: 'Auto-save failed — your changes may not be preserved after a page refresh.',
  deleteAllImages: 'Delete all images?',
  yesDelete: 'Yes, delete',
  generateCards: (n) => `Generate the ${n} cards`,
  reshuffleCards: 'Reshuffle all the cards',
  cardGenerationError: 'Card generation failed — the mathematical layout could not be validated.',
  footer: 'Fair use license © 2026 R. Deleuze',

  imagesPerCard: 'Number of images per card',

  width: 'Width',
  height: 'Height',
  diameter: 'Diameter',
  margin: 'Margin',
  marginVertical: 'Margin vertical',
  marginHorizontal: 'Margin horizontal',
  background: 'Background',
  browsePng: 'Browse PNG',
  remove: 'Remove',
  preview: 'Preview',

  exportPng: 'Export Images PNG',
  exportPdf: 'Export Fullpage PDF',
  exportingPng: 'Exporting…',
  exportingPdf: 'Generating PDF…',
  exportInstructions: 'Export Instruction Cards',
  exportingInstructions: 'Exporting…',
  exportFailed: 'Export failed. Please try again.',
  printHintLabel: 'Cards can be printed at:',
  printHintDisclaimer: '(Not affiliated or sponsored)',

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
  extraStepsLabel: 'Extra steps',
  games: [
    {
      title: "The Tower",
      goal: "Gather the most cards.",
      steps: [
        "Deal one card face down to each player.",
        "Stack the remaining cards face up in the center, accessible to all.",
        "All players flip their card at the same time and race to spot the matching symbol between their card and the top of the central pile.",
        "The first player to spot it shouts the symbol name aloud, then takes that card and places it on top of their own.",
        "Once taken, a new card is revealed at the top of the central pile.",
        "Keep finding matches between your top card and the central pile, as fast as possible.",
      ],
    },
    {
      title: "The Well",
      goal: "Get rid of all your cards first.",
      steps: [
        "Unlike The Tower, all shuffled cards are dealt evenly between players.",
        "Each player has their own face-down pile. The last card is placed face up in the middle.",
        "All players flip their piles at the same time, revealing a top card.",
        "Find a symbol on your card that matches the central card.",
        "When you spot it, shout the symbol name and discard your card onto the central pile.",
        "The middle card changes when a player places theirs on top — keep finding a match with the new card.",
        "Repeat until a player has discarded all their cards. That player wins!",
      ],
    },
    {
      title: "The Hot Potato",
      goal: "Shed your cards faster than anyone.",
      steps: [
        "Best played with 4 or more people over multiple rounds.",
        "Each player receives a random card, held face down.",
        "All players flip their card at the same time so everyone can see each other's cards.",
        "Find the matching symbol between your card and any other player's card.",
        "As soon as you spot it, shout the symbol name and place your card on top of that player's card.",
        "That player now uses the new top card on their pile; if they find a match, they pass all their cards onto that player's pile.",
        "Play continues until one player holds all the cards. Get rid of yours as fast as possible!",
      ],
      extra_steps: [
        "This game moves fast — play at least 5 rounds to find an overall winner.",
        "You can keep playing until no cards remain to be dealt.",
        "The loser is the player who has accumulated the most cards across all rounds.",
      ],
    },
    {
      title: "Catch Them All!",
      goal: "Collect the most cards.",
      steps: [
        "Best played over multiple rounds.",
        "Place one card face up in the center, then deal one card face down to each player.",
        "On the signal, players flip their card around the central card.",
        "Race to find matching symbols between the outer cards and the central card.",
        "When you spot a match, shout the symbol name and take that card.",
        "You may take your own card or someone else's — but never the central card, which stays in place throughout the round.",
      ],
      extra_steps: [
        "When all cards have been taken, start a new round: place the central card at the bottom of the draw pile and reveal a new one.",
        "Cards won are kept across rounds.",
        "Play until no cards remain to be drawn. The winner is the player with the most cards.",
      ],
    },
    {
      title: "The Poisoned Gift",
      goal: "Collect as few cards as possible.",
      steps: [
        "Deal one card face down to each player, with the draw pile face up in the middle.",
        "All players reveal their card at the same time — but this time, you watch everyone else's cards, not your own.",
        "Spot the matching symbol between the central pile card and any other player's card.",
        "Once found, take the central card and place it on top of that opponent's pile.",
        "This reveals a new card in the center, continuing the game.",
        "Play continues until all cards from the central pile have been distributed.",
        "The player with the fewest cards at the end wins.",
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
  fillWithDefaults: 'Remplir aléatoirement',
  resetAll: 'Tout réinitialiser',
  autoSaveError: 'La sauvegarde automatique a échoué — vos modifications peuvent ne pas être préservées après un rechargement.',
  deleteAllImages: 'Supprimer toutes les images ?',
  yesDelete: 'Oui, supprimer',
  generateCards: (n) => `Générer les ${n} cartes`,
  reshuffleCards: 'Rebattre toutes les cartes',
  cardGenerationError: "La génération des cartes a échoué — la disposition mathématique n'a pas pu être validée.",
  footer: "Fair use license © 2026 R. Deleuze",

  imagesPerCard: "Nombre d'images par carte",

  width: 'Largeur',
  height: 'Hauteur',
  diameter: 'Diamètre',
  margin: 'Marge',
  marginVertical: 'Marge verticale',
  marginHorizontal: 'Marge horizontale',
  background: 'Arrière-plan',
  browsePng: 'Parcourir PNG',
  remove: 'Supprimer',
  preview: 'Aperçu',

  exportPng: 'Exporter en PNG',
  exportPdf: 'Exporter PDF pleine page',
  exportingPng: 'Exportation…',
  exportingPdf: 'Génération du PDF…',
  exportInstructions: 'Exporter les cartes d\'instructions',
  exportingInstructions: 'Exportation…',
  exportFailed: "L'export a échoué. Veuillez réessayer.",
  printHintLabel: 'Les cartes peuvent être imprimées sur :',
  printHintDisclaimer: '(Aucune affiliation ni partenariat)',

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
  extraStepsLabel: 'Étapes supplémentaires',
  games: [
    {
      title: "La Tour",
      goal: "Collecter le plus de cartes.",
      steps: [
        "Placer une face cachée devant chaque joueur.",
        "Les cartes restantes sont empilées face visible au centre, accessibles à tous.",
        "Tous les joueurs retournent leur carte en même temps et doivent se précipiter pour identifier le symbole identique entre leur carte et celle visible au sommet de la pile centrale.",
        "Le premier joueur à repérer cette correspondance crie le nom du symbole à voix haute, puis prend la carte de la pile pour la poser sur la sienne.",
        "Une fois cette carte prise, une nouvelle carte est révélée au sommet de la pile centrale.", 
        "Les joueurs continuent à trouver les symboles identiques entre leur carte du dessus et celle du sommet de la pile, le plus vite possible.",
      ],
    },
    {
      title: "Le Puits",
      goal: "Se débarrasser de toutes ses cartes en premier.",
      steps: [
        "Contrairement à La Tour, toutes les cartes sont cette fois distribuées équitablement entre les joueurs.",
        "Chaque joueur dispose de sa propre pile de cartes face cachée. La dernière carte est placée face visible au milieu.",
        "Tous les joueurs retournent leur pile en même temps, révélant une carte du dessus avec des symboles.",
        "L'objectif est de trouver un symbole sur votre carte qui correspond à la carte centrale.",
        "Lorsque le symbole est identifié, criez son nom et défaussez votre carte sur la pile centrale.",
        "La carte du milieu change lorsqu'un joueur pose la sienne dessus ; les joueurs continuent alors à trouver une correspondance avec cette nouvelle carte.",
        "Répétez jusqu'à ce qu'un joueur ait posé toutes ses cartes. C'est le gagnant !",
      ],
    },
    {
      title: "La Patate Chaude",
      goal: "Se débarrasser de sa carte avant les autres.",
      steps: [
        "La Patate Chaude est le jeu le plus rapide, jouable sur plusieurs manches, idéalement avec 4 joueurs ou plus.",
        "Chaque joueur reçoit une carte au hasard, tenue face cachée",
        "Tous les joueurs retournent leur carte en même temps, de sorte que chacun puisse voir les cartes des autres.",
        "Les joueurs peuvent regarder n'importe quelle carte de leurs adversaires, mais ils doivent trouver en vitesse le symbole identique entre leur propre carte et celle d'un autre joueur.",
        "Dès qu'un joueur repère une correspondance, il la crie à voix haute puis pose sa carte sur celle de l'adversaire avec qui il a fait la correspondance.",
        "Cet adversaire utilise alors la nouvelle carte sur sa pile ; s'il trouve une correspondance avec un autre joueur, il pose toutes ses cartes sur la pile de ce joueur.",
        "Le jeu continue jusqu'à ce qu'un joueur se retrouve avec toutes les cartes. L'objectif est donc de se débarrasser de sa ou ses carte(s) le plus vite possible.",
      ],
      extra_steps: [
        "Étant donné la rapidité du jeu, il est conseillé de disputer au moins 5 manches pour désigner un vainqueur général.",
        "Vous pouvez jouer jusqu'à ce qu'il n'y ait plus de cartes à distribuer.",
        "Le perdant sera celui qui a accumulé le plus de cartes sur l'ensemble des manches.",
      ],
    },
    {
      title: "Attrape Tout !",
      goal: "Collecter le plus de cartes.",
      steps: [
        "Attrape Tout est idéal sur plusieurs manches.",
        "Placer une carte face visible devant les joueurs, puis une carte face cachée devant chaque participant.",
        "Au signal, les joueurs retournent leur carte autour de la carte centrale.",
        "Les joueurs s'affrontent pour trouver des symboles identiques entre les cartes extérieures et la carte centrale.",
        "Dès que vous trouvez un symbole identique, criez-le à voix haute puis prenez la carte.",
        "Cela peut être votre propre carte ou celle d'un autre joueur, mais ne prenez jamais la carte centrale — elle reste la même pendant tout le tour.",
      ],
      extra_steps: [
        "Quand toutes les cartes ont été prises et qu'il ne reste que la carte centrale, un nouveau tour commence : placez la carte centrale d'origine au bas de la pioche principale et retournez-en une nouvelle.",
        "Les cartes gagnées sont conservées d'une manche à l'autre.",
        "Vous pouvez jouer jusqu'à ce qu'il n'y ait plus de cartes à piocher. Le vainqueur sera le joueur qui a accumulé le plus de cartes.",
      ],
    },
    {
      title: "Le Cadeau Empoisonné",
      goal: "Collecter le moins de cartes possible.",
      steps: [
        "Placez une carte face cachée devant chaque joueur, avec la pioche face visible au milieu.",
        "Tous les joueurs révèlent leur carte en même temps, mais cette fois vous regardez les cartes des autres et non la vôtre.",
        "Vous devez repérer le symbole identique entre la carte de la pile centrale et la carte de n'importe quel autre joueur.",
        "Une fois le symbole identifié, prenez la carte du milieu et posez-la sur la pile de cartes de votre adversaire.",
        "Cela révèle une nouvelle carte au centre, poursuivant le jeu.",
        "La partie continue jusqu'à ce que toutes les cartes de la pile centrale aient été distribuées.",
        "Le gagnant du mini-jeu est celui qui a le moins de cartes à la fin.",
      ],
    },
  ],
  createYourDeck: 'Créer votre propre jeu',
};

const es: AppTranslations = {
  cancel: 'Cancelar',
  ok: 'OK',

  heroTitle: 'Creador de cartas Dobble',
  heroSubtitle: 'Sube tus propias imágenes, genera un mazo de cartas personalizado y expórtalo en segundos.',
  howToPlayLink: '¿Cómo jugar a Dobble?',
  imagesNeeded: (n) => `Imágenes — ${n} necesarias`,
  fillWithDefaults: 'Rellenar al azar',
  resetAll: 'Restablecer todo',
  autoSaveError: 'El guardado automático falló — es posible que los cambios no se conserven al recargar la página.',
  deleteAllImages: '¿Eliminar todas las imágenes?',
  yesDelete: 'Sí, eliminar',
  generateCards: (n) => `Generar las ${n} cartas`,
  reshuffleCards: 'Mezclar todas las cartas',
  cardGenerationError: 'La generación de cartas falló — el diseño matemático no pudo validarse.',
  footer: 'Fair use license © 2026 R. Deleuze',

  imagesPerCard: 'Número de imágenes por carta',

  width: 'Ancho',
  height: 'Alto',
  diameter: 'Diámetro',
  margin: 'Margen',
  marginVertical: 'Margen vertical',
  marginHorizontal: 'Margen horizontal',
  background: 'Fondo',
  browsePng: 'Buscar PNG',
  remove: 'Eliminar',
  preview: 'Vista previa',

  exportPng: 'Exportar imágenes PNG',
  exportPdf: 'Exportar PDF de página completa',
  exportingPng: 'Exportando…',
  exportingPdf: 'Generando PDF…',
  exportInstructions: 'Exportar cartas de instrucciones',
  exportingInstructions: 'Exportando…',
  exportFailed: 'La exportación falló. Por favor, inténtelo de nuevo.',
  printHintLabel: 'Las cartas se pueden imprimir en:',
  printHintDisclaimer: '(Sin afiliación ni patrocinio)',

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
  extraStepsLabel: 'Etapas adicionales',
  games: [
    {
      title: "La Torre",
      goal: "Reunir la mayor cantidad de cartas.",
      steps: [
        "Reparte una carta boca abajo frente a cada jugador.",
        "Las cartas restantes se apilan boca arriba en el centro, accesibles para todos.",
        "Todos los jugadores voltean su carta al mismo tiempo y deben apresurarse a identificar el símbolo idéntico entre su carta y la del tope de la pila central.",
        "El primer jugador en notarlo grita el nombre del símbolo en voz alta y toma esa carta para colocarla encima de la suya.",
        "Una vez tomada, se revela una nueva carta en el tope de la pila central.",
        "Sigue encontrando coincidencias entre tu carta superior y la pila central, lo más rápido posible.",
      ],
    },
    {
      title: "El Pozo",
      goal: "Deshacerse de todas las cartas primero.",
      steps: [
        "Al contrario que La Torre, todas las cartas barajadas se distribuyen equitativamente entre los jugadores.",
        "Cada jugador tiene su propia pila boca abajo. La última carta se coloca boca arriba en el centro.",
        "Todos los jugadores voltean su pila al mismo tiempo, revelando una carta superior.",
        "Encuentra un símbolo en tu carta que coincida con la carta central.",
        "Cuando lo identifiques, grita el nombre del símbolo y descarta tu carta en la pila central.",
        "La carta del centro cambia cuando un jugador pone la suya encima — sigue buscando una coincidencia con la nueva carta.",
        "¡Repite hasta que un jugador haya descartado todas sus cartas. ¡Ese jugador gana!",
      ],
    },
    {
      title: "La Papa Caliente",
      goal: "Pasar tus cartas antes que nadie.",
      steps: [
        "Ideal con 4 o más personas y se juega en múltiples rondas.",
        "Cada jugador recibe una carta al azar, sostenida boca abajo.",
        "Todos voltean su carta al mismo tiempo para que todos puedan ver las cartas de los demás.",
        "Encuentra el símbolo idéntico entre tu carta y la de cualquier otro jugador.",
        "En cuanto lo notes, grita el nombre del símbolo y coloca tu carta encima de la de ese jugador.",
        "Ese jugador usará la nueva carta de su pila; si encuentra una coincidencia, coloca todas sus cartas encima de las de ese jugador.",
        "El juego continúa hasta que un jugador tenga todas las cartas. ¡Deshacerse de las tuyas lo antes posible!",
      ],
      extra_steps: [
        "El juego es muy rápido — juega al menos 5 rondas para determinar un ganador general.",
        "Puedes seguir jugando hasta que no queden más cartas por repartir.",
        "El perdedor es quien haya acumulado más cartas en todas las rondas.",
      ],
    },
    {
      title: "¡Atrapa Todo!",
      goal: "Reunir la mayor cantidad de cartas.",
      steps: [
        "Ideal para múltiples rondas.",
        "Coloca una carta boca arriba en el centro y reparte una carta boca abajo a cada participante.",
        "A la señal, los jugadores voltean su carta alrededor de la carta central.",
        "Compite para encontrar símbolos idénticos entre las cartas exteriores y la carta central.",
        "En cuanto encuentres uno, grítalo en voz alta y toma esa carta.",
        "Puede ser tu propia carta o la de otro jugador, pero nunca tomes la carta central — permanece igual durante toda la ronda.",
      ],
      extra_steps: [
        "Cuando todas las cartas hayan sido tomadas, inicia una nueva ronda: coloca la carta central al fondo del mazo y saca una nueva.",
        "Las cartas ganadas se conservan entre rondas.",
        "Juega hasta que no haya más cartas. Gana quien haya acumulado más.",
      ],
    },
    {
      title: "El Regalo Envenenado",
      goal: "Reunir la menor cantidad de cartas posible.",
      steps: [
        "Reparte una carta boca abajo frente a cada jugador, con el mazo boca arriba en el centro.",
        "Todos revelan su carta al mismo tiempo — pero esta vez observas las cartas de los demás, no la tuya.",
        "Encuentra el símbolo idéntico entre la carta de la pila central y la de cualquier otro jugador.",
        "Una vez encontrado, toma la carta central y colócala encima de la pila de ese oponente.",
        "Esto revela una nueva carta en el centro, continuando el juego.",
        "La partida sigue hasta que todas las cartas de la pila central hayan sido distribuidas.",
        "El jugador con menos cartas al final gana.",
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
