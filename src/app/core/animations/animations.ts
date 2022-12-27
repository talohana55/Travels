import {
    animate,
    AnimationTriggerMetadata,
    style,
    transition,
    trigger,
} from "@angular/animations";

export function FadeIn(timingIn: number): AnimationTriggerMetadata {
    return trigger("fadeIn", [
        transition(":enter", [
            style({ opacity: 0 }),
            animate(timingIn, style({ opacity: 1 })),
        ]),
    ]);
}
