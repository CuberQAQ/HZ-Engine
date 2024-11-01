import { Profile } from "./animation";

export const ExampleProfile1: Profile = [
    [ // alpha
        {
            frame: {
                alpha: 0,
            }
        },
        {
            time: 0.5,
            wrapper: "easein",
            frame: {
                alpha: 1,
            }
        }
    ],
    [ // x
        {
            frame: {
                xalign: -1,
                xanchor: -1,
            }
        },
        {
            time: 1.0,
            wrapper: "easein",
            frame: {
                xalign: 1,
                xanchor: 1,
            }
        }

    ]
]