import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface TicketsDialogData {
    maxTickets: number;
}

@Component({
    selector: "tickets-dialog",
    templateUrl: "tickets-dialog.html",
})
export class TicketsDialog {
    ticketsCtrl = new FormControl(0, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.data.maxTickets),
    ]);

    constructor(
        public dialogRef: MatDialogRef<TicketsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: TicketsDialogData
    ) {}

    close(): void {
        this.dialogRef.close();
    }
}
