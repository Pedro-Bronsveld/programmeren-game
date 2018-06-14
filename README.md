# programmeren-game
[>> Link naar game. <<](https://pedro-bronsveld.github.io/programmeren-game/)

## toepassing OOP
### Classes
De code is in classes verdeeld, bijna iedere class heeft een eigen bestand.
Deze verdeling van code over verschillende classes houd de code overzichtelijk.
### Encapsulation
Iedere class is verantwoordelijk voor zijn eigen eigenschappen. Om deze reden zijn deze eigenschappen private. 
Sommige functies van de classes zijn public waardoor de verschillende classes elkaar kunnen aanspreken.
### Composition
De game begint met een alles bevattend 'Game' object. Het game object bevat een 'Level' object waarin het level geladen wordt.
Het level bevat een array met daarin alle 'GameObjects'. Ook bevat het level de 'Player'. 
Doordat het level een object in game is, kan op ieder moment een ander level geladen worden.
Ook zorgt composition er voor dat objecten gebruik kunnen maken van de three.js library.
### Inheritance
Verschillende classes extenden elkaar om overeenkomende functies te kunnen hergebruiken.
De 'MobileModel' class extend de 'Model' class. Beide classen hebben een positie in de wereld, maar alleen MobileModel kan zich door de wereld bewegen. 

## UML diagram
![UML Diagram](uml_diagram.png)

## [Feedback van Lem](https://github.com/boltgolt/prg4-game#peer-review-pedro)

## feedback game Lem
[Repository](https://github.com/boltgolt/prg4-game)

De OOP principes zijn allemaal toegepast in de game. 
De game is verdeeld in classes, waarvan een aantal eigenschappen van elkaar eigenschappen overerfen. 
Eigenschappen die alleen door de class zelf moeten kunnen worden aangepast staan aangegeven met 'private'.

De game zelf heeft helaas nog geen echt doel, en mist een startscherm en eindscherm.
Daarentegen zijn er geen bugs, en voelen de controls erg soepel aan.