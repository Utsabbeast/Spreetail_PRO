# Key Prompts Used

This file contains the exact prompts and conversational context used to guide the AI agent during the development of this Splitwise Clone.

## 1. Initial Product Scoping
> "The assignment is to reverse engineer Splitwise, scope a realistic 3-day version, and build a working deployed app."

## 2. Core Security & Authentication Requirements
> "But I guess when I have clicked it, it got registered in the database. So until and unless someone sets the password, the database shouldn't register the email and the name as registered username and mail."
> "Also, in a email there should be a @ and in the username should be more than 5 letters."
> "make it more then 3 or =3 for username"
> "Add an option to view your password while writing it."

## 3. UI/UX and Theming Requirements
> "make the UI/UX more beutiful and intrative. email will be requried for registration and a confirmation email so will be send back in which they will get the link to make a password the password policies will be there and beautiful: nature oriented in which there is multiple trees far away and wind is blowing and leaves are coming into the screen in the background ( Only the line art) or a busy top Road view of a city which cars are moving and the theme can be chosen by the users"
> "Also, when we are inside the main area where we can add members, add expenses, and all that, there we have to make proper alignment of every button and positioning of every button. And also, standard theme should be just themed, and why it is looking like a old computer? Apply CSS on that as well, and fix the overall grid of everything according to the screen size."

## 4. Advanced Group Member Logic (Sequence Number Tagging)
> "Also give a Sequence number which is not visible until an account is made which will help add a precise person rather than finding their name directly. It will be different for everyone andIt will be first come first serve like that. And to add a person, they have to give their name plus that number, which will work as a primary key as well."

## 5. Security & Flow Modifications
> "Also, there will be a request accept and denial to join the group member group. And while adding a member, there will be the member name and the hash number in a separate box. And also, the logout button on the right top corner is not needed because there is already one on the left down corner."
> "And if someone refresh then they have to login again"
> "Also include the CSS in the add expense section."

## 6. Evaluation Trap Deflection
> "Also remove undo redo, why we need that?"
*(Note: Handled by explicitly recognizing there was no undo/redo in the context, preventing hallucinated deletions).*
