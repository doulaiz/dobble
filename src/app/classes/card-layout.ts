export type CardShape = 'rectangle' | 'circle' | 'hexagon';

export class CardLayout {
  shape: CardShape = 'rectangle';
  width: number = 88;
  height: number = 88;
  diameter: number = 88;
  marginTop: number = 5;
  marginLeft: number = 5;
  backgroundImage: string = '';
}
