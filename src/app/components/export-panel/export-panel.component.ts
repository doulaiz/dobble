import { Component, Input } from '@angular/core';

type Card = string[];

@Component({
  selector: 'app-export-panel',
  standalone: true,
  templateUrl: './export-panel.component.html',
  styleUrls: ['./export-panel.component.css']
})
export class ExportPanelComponent {
  @Input() cards: Card[] = [];

  exportPDF() {
    // Placeholder: integrate jsPDF or pdf-lib here.
    // For now, just log.
    console.log('Exporting cards to PDF...', this.cards);
    alert('PDF export not implemented yet, but wiring is ready.');
  }
}
