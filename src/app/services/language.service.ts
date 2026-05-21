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
  extraStepsLabel: 'Extra steps',
  games: [
    {
      title: "The Tower",
      goal: "Be the player who has gathered the most cards when the draw pile runs out.",
      steps: [
        "Shuffle all of the cards then place one face down in front of each player, with the remaining cards placed face up in a pile accessible to all players.",
        "All players flip their cards at the same time and must rush to identify the matching symbol on their card with the card which is face up on the central pile.",
        "The first player to notice this match will shout the symbol name aloud then take this card from the pile to place on top of their own card.",
        "Once this card is taken, a new card is revealed on the central pile. Players will continue to find the matching symbols between their top card and the top pile card as quickly as possible.",
      ],
    },
    {
      title: "The Well",
      goal: "The winner of this mini game is the person who gets rid of all of their cards first, whereas the person who takes the longest is the loser.",
      steps: [
        "Opposite to the Towering Inferno game, this time all shuffled cards will be distributed evenly between all players. Each player should have a pile of their own cards face down. The final card is placed face up in the middle of players.",
        "All players will flip their piles at the same time, revealing a top card with symbols. The aim is to find a symbol on your own card which matches the central card.",
        "This time when the symbol is identified, you will shout out the symbol name but discard your card on the central pile. The middle card will change when a player puts their card on top, so players will continue to find a match with this new card.",
        "Repeat until a player has placed down all of their cards. They are the winner!",
      ],
    },
    {
      title: "The Hot Potato",
      goal: "Get rid of your cards faster than the other players!",
      steps: [
        "The Hot Potato is the quickest game which can be played over multiple rounds, best played with 4 or more people. All players will be handed a random card which they will hold face down. All players will turn their hand over at the same time, so that everyone can visibly see each other's cards.",
        "Players can choose to look at any card of their opponents, but you will race to find the matching symbol between your card and one of the other players'. As soon as a player notices a matching symbol, they will say it aloud then place their card on top of the opponent's card they matched with.",
        "This opponent will then use the new card on their pile, if they find a match with another player they will place all of their cards on top of the player's card. The game will continue until one player is left with all of the cards. Therefore, the aim of the game is to get rid of your card/s as soon as possible.",
        "Considering this happens so quickly, it is recommended that you play this minigame over at least 5 rounds to determine an overall winner. You could choose to continue playing until there are no more cards to hand out. The loser will be the person who has gained the most cards over all of the rounds.",
      ],
    },
    {
      title: "Gotta Catch Them All!",
      goal: "Collect as many cards as possible before the other players!",
      steps: [
        "Gotta Catch Them All is best played over multiple rounds. Start by placing one card face up in front of players, then place one card face down in front of each person participating. On go, players will turn their card over around the middle card.",
        "Players will race to find matching symbols between all of the outside cards with the middle card. Once you have found an identical symbol, shout this aloud then take the card. This could be your own card or someone else's, but you must never take the middle card as this remains the same throughout the round.",
      ],
      extra_steps: [
        "When all cards have been taken, and only the middle card remains, a new round can be started by placing the original middle card to the bottom of the main pile of cards and drawing a new one. Gained cards are kept across different rounds.",
        "You could play until there are no longer any cards to be drawn. The winner will be the player who has gained the most cards.",
      ],
    },
    {
      title: "The Poisoned Gift",
      goal: "Collect as few cards as possible from the deck. Arguably, the minigame that's likely to cause the most arguments, this time, players could feel sabotaged!",
      steps: [
        "Place one card face down in front of each player, with the draw pile face up in the middle. All players will reveal their card at the same time, but this time you are looking at everybody else's cards rather than your own. You must spot the identical symbol between the card in the central pile with any other player's card.",
        "Once you have identified a matching symbol, you will draw the middle card and place it on top of your opponent's pile of cards. This will reveal a new card in the centre, continuing the game. The game continues until all cards from the middle pile have been distributed. The winner of this minigame is the person who has the least amount of cards at the end.",
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
  extraStepsLabel: 'Étapes supplémentaires',
  games: [
    {
      title: "La Tour",
      goal: "Être le joueur qui a collecté le plus de cartes lorsque la pioche est épuisée.",
      steps: [
        "Mélangez toutes les cartes, puis placez-en une face cachée devant chaque joueur. Les cartes restantes sont empilées face visible au centre, accessibles à tous.",
        "Tous les joueurs retournent leur carte en même temps et doivent se précipiter pour identifier le symbole identique entre leur carte et celle visible au sommet de la pile centrale.",
        "Le premier joueur à repérer cette correspondance crie le nom du symbole à voix haute, puis prend la carte de la pile pour la poser sur la sienne.",
        "Une fois cette carte prise, une nouvelle carte est révélée au sommet de la pile centrale. Les joueurs continuent à trouver les symboles identiques entre leur carte du dessus et celle du sommet de la pile, le plus vite possible.",
      ],
    },
    {
      title: "Le Puits",
      goal: "Le gagnant est celui qui se débarrasse de toutes ses cartes en premier ; celui qui prend le plus de temps est le perdant.",
      steps: [
        "Contrairement à La Tour, toutes les cartes mélangées sont cette fois distribuées équitablement entre les joueurs. Chaque joueur dispose de sa propre pile de cartes face cachée. La dernière carte est placée face visible au milieu.",
        "Tous les joueurs retournent leur pile en même temps, révélant une carte du dessus avec des symboles. L'objectif est de trouver un symbole sur votre carte qui correspond à la carte centrale.",
        "Lorsque le symbole est identifié, criez son nom et défaussez votre carte sur la pile centrale. La carte du milieu change lorsqu'un joueur pose la sienne dessus ; les joueurs continuent alors à trouver une correspondance avec cette nouvelle carte.",
        "Répétez jusqu'à ce qu'un joueur ait posé toutes ses cartes. C'est le gagnant !",
      ],
    },
    {
      title: "La Patate Chaude",
      goal: "Débarrassez-vous de vos cartes plus vite que les autres joueurs !",
      steps: [
        "La Patate Chaude est le jeu le plus rapide, jouable sur plusieurs manches, idéalement avec 4 joueurs ou plus. Chaque joueur reçoit une carte au hasard, tenue face cachée. Tous les joueurs retournent leur carte en même temps, de sorte que chacun puisse voir les cartes des autres.",
        "Les joueurs peuvent regarder n'importe quelle carte de leurs adversaires, mais ils doivent trouver en vitesse le symbole identique entre leur propre carte et celle d'un autre joueur. Dès qu'un joueur repère une correspondance, il la crie à voix haute puis pose sa carte sur celle de l'adversaire avec qui il a fait la correspondance.",
        "Cet adversaire utilise alors la nouvelle carte sur sa pile ; s'il trouve une correspondance avec un autre joueur, il pose toutes ses cartes sur la pile de ce joueur. Le jeu continue jusqu'à ce qu'un joueur se retrouve avec toutes les cartes. L'objectif est donc de se débarrasser de sa ou ses carte(s) le plus vite possible.",
        "Étant donné la rapidité du jeu, il est conseillé de disputer au moins 5 manches pour désigner un vainqueur général. Vous pouvez jouer jusqu'à ce qu'il n'y ait plus de cartes à distribuer. Le perdant sera celui qui a accumulé le plus de cartes sur l'ensemble des manches.",
      ],
    },
    {
      title: "Attrape-les Tous !",
      goal: "Collectez le plus de cartes possible avant les autres joueurs !",
      steps: [
        "Attrape-les Tous est idéal sur plusieurs manches. Commencez par placer une carte face visible devant les joueurs, puis une carte face cachée devant chaque participant. Au signal, les joueurs retournent leur carte autour de la carte centrale.",
        "Les joueurs s'affrontent pour trouver des symboles identiques entre les cartes extérieures et la carte centrale. Dès que vous trouvez un symbole identique, criez-le à voix haute puis prenez la carte. Cela peut être votre propre carte ou celle d'un autre joueur, mais ne prenez jamais la carte centrale — elle reste la même pendant tout le tour.",
      ],
      extra_steps: [
        "Quand toutes les cartes ont été prises et qu'il ne reste que la carte centrale, un nouveau tour commence : placez la carte centrale d'origine au bas de la pioche principale et retournez-en une nouvelle. Les cartes gagnées sont conservées d'une manche à l'autre.",
        "Vous pouvez jouer jusqu'à ce qu'il n'y ait plus de cartes à piocher. Le vainqueur sera le joueur qui a accumulé le plus de cartes.",
      ],
    },
    {
      title: "Le Cadeau Empoisonné",
      goal: "Collectez le moins de cartes possible. C'est sans doute le mini-jeu qui provoque le plus de disputes — les joueurs peuvent avoir l'impression d'être sabotés !",
      steps: [
        "Placez une carte face cachée devant chaque joueur, avec la pioche face visible au milieu. Tous les joueurs révèlent leur carte en même temps, mais cette fois vous regardez les cartes des autres et non la vôtre. Vous devez repérer le symbole identique entre la carte de la pile centrale et la carte de n'importe quel autre joueur.",
        "Une fois le symbole identifié, prenez la carte du milieu et posez-la sur la pile de cartes de votre adversaire. Cela révèle une nouvelle carte au centre, poursuivant le jeu. La partie continue jusqu'à ce que toutes les cartes de la pile centrale aient été distribuées. Le gagnant du mini-jeu est celui qui a le moins de cartes à la fin.",
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
  extraStepsLabel: 'Etapas adicionales',
  games: [
    {
      title: "La Torre",
      goal: "Sé el jugador que ha reunido más cartas cuando se agote el mazo.",
      steps: [
        "Baraja todas las cartas y coloca una boca abajo frente a cada jugador; las cartas restantes se apilan boca arriba en el centro, accesibles para todos.",
        "Todos los jugadores voltean su carta al mismo tiempo y deben apresurarse a identificar el símbolo idéntico entre su carta y la que está boca arriba en la pila central.",
        "El primer jugador en notar la coincidencia grita el nombre del símbolo en voz alta y toma esa carta de la pila para colocarla encima de la suya.",
        "Una vez tomada esa carta, se revela una nueva en la pila central. Los jugadores siguen encontrando los símbolos idénticos entre su carta superior y la del tope de la pila, lo más rápido posible.",
      ],
    },
    {
      title: "El Pozo",
      goal: "El ganador es quien se deshace de todas sus cartas primero; quien tarde más es el perdedor.",
      steps: [
        "Al contrario que La Torre, esta vez todas las cartas barajadas se distribuyen equitativamente entre los jugadores. Cada jugador tendrá su propia pila de cartas boca abajo. La última carta se coloca boca arriba en el centro.",
        "Todos los jugadores voltean su pila al mismo tiempo, revelando una carta superior con símbolos. El objetivo es encontrar un símbolo en tu carta que coincida con la carta central.",
        "Cuando se identifica el símbolo, gritas su nombre y descartas tu carta en la pila central. La carta del medio cambia cuando un jugador pone la suya encima; los jugadores siguen buscando una coincidencia con esa nueva carta.",
        "¡Repite hasta que un jugador haya colocado todas sus cartas. ¡Ese es el ganador!",
      ],
    },
    {
      title: "La Papa Caliente",
      goal: "¡Deshacerse de tus cartas más rápido que los demás jugadores!",
      steps: [
        "La Papa Caliente es el juego más rápido, jugable en múltiples rondas, ideal con 4 o más personas. A cada jugador se le entrega una carta al azar que sostiene boca abajo. Todos voltean su carta al mismo tiempo para que todos puedan ver las cartas de los demás.",
        "Los jugadores pueden mirar cualquier carta de sus oponentes, pero deben encontrar rápidamente el símbolo idéntico entre su propia carta y la de algún otro jugador. En cuanto un jugador nota la coincidencia, la grita en voz alta y coloca su carta encima de la del oponente con quien hizo la coincidencia.",
        "Ese oponente usará entonces la nueva carta de su pila; si encuentra una coincidencia con otro jugador, colocará todas sus cartas encima de la pila de ese jugador. El juego continúa hasta que un jugador se quede con todas las cartas. El objetivo es, por tanto, deshacerse de tu(s) carta(s) lo antes posible.",
        "Dado que todo ocurre muy rápido, se recomienda jugar al menos 5 rondas para determinar un ganador general. Puedes seguir jugando hasta que no queden más cartas por repartir. El perdedor será quien haya acumulado más cartas en todas las rondas.",
      ],
    },
    {
      title: "¡Atrapa a Todos!",
      goal: "¡Reúne la mayor cantidad de cartas antes que los demás jugadores!",
      steps: [
        "¡Atrapa a Todos es ideal para múltiples rondas. Comienza colocando una carta boca arriba frente a los jugadores y luego una carta boca abajo frente a cada participante. A la señal, los jugadores voltean su carta alrededor de la carta central.",
        "Los jugadores compiten para encontrar símbolos idénticos entre las cartas exteriores y la carta central. En cuanto encuentres un símbolo idéntico, grítalo en voz alta y toma la carta. Puede ser tu propia carta o la de otro jugador, pero nunca debes tomar la carta central — permanece igual durante toda la ronda.",
      ],
      extra_steps: [
        "Cuando todas las cartas hayan sido tomadas y solo quede la carta central, inicia una nueva ronda: coloca la carta central original en la parte inferior del mazo principal y saca una nueva. Las cartas ganadas se conservan entre rondas.",
        "Puedes jugar hasta que no haya más cartas en el mazo. Gana el jugador que haya acumulado más cartas.",
      ],
    },
    {
      title: "El Regalo Envenenado",
      goal: "Reúne la menor cantidad de cartas posible. Es, sin duda, el minijuego que más disputas puede provocar — ¡los jugadores pueden sentirse saboteados!",
      steps: [
        "Coloca una carta boca abajo frente a cada jugador, con el mazo boca arriba en el centro. Todos los jugadores revelan su carta al mismo tiempo, pero esta vez observas las cartas de los demás, no la tuya. Debes encontrar el símbolo idéntico entre la carta de la pila central y la carta de cualquier otro jugador.",
        "Una vez identificado el símbolo, tomas la carta del centro y la colocas encima de la pila de cartas de tu oponente. Esto revela una nueva carta en el centro, continuando el juego. La partida sigue hasta que todas las cartas de la pila central hayan sido distribuidas. El ganador del minijuego es quien tenga menos cartas al final.",
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
