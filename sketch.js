// REFERENCE: https://www.tate.org.uk/art/artworks/nake-no-title-p80809
// No Title - 1967, Frieder Nake

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    angleMode(DEGREES);
    // https://p5js.org/reference/p5/blendMode/ 
    blendMode(DARKEST);
}

function draw() {
    background("#e8e6e4");
    let unitCount = 14; // N Righe == N colonne

    // Il contenuto in cui sono stati disegnati gli elementi quadrati è composto da una griglia 14x14 di elementi quadrati della stessa dimensione. 
    // Tale struttura la si può notare ripetuta uguale anche nelle opere parte della stessa collezione. 
    // Il singolo elemento quadrato della griglia è stato poi modificato randomicamente per: dimensione, orientamento e colore. 

    // misurazioni dall'opera originale
    let measuredContent = 880;
    let measuredMargin = 260;
    let measuredStroke = 9;

    // il calcolo dell'aspect ratio mi permette di ottenere delle proporzioni indipendenti dai pixel, proporzioni che devono mantenersi rispettate per far si che il contenuto sia responsive

    // marginContentRatio = quante volte sta il margine nel content
    let marginContentRatio = measuredMargin / measuredContent;
    // (contentSize * strokeToContentRatio) = strokeWeight
    let strokeToContentRatio = measuredStroke / measuredContent;

    // margine = (contentSize * marginContentRatio) 
    // min(windowWidth, windowHeight) = (contentSize) + (margine * 2)
    let contentSize = min(windowWidth, windowHeight) / (marginContentRatio * 2 + 1);

    // unitSize = dimensione dell'unità della griglia di 14x14 (quadrato --> dimensione unica)
    let unitSize = contentSize / unitCount;
    let contentX = (windowWidth - contentSize) / 2;
    let contentY = (windowHeight - contentSize) / 2;

    // faccio si che il margine vari in base alla dimensione del contenuto in modo che il contenutosia responsive
    let strokeSize = contentSize * strokeToContentRatio;
    strokeWeight(strokeSize);

    // calcolo le coordinate del centro della prima riga e colonna e imposto lì l'origine del disegno
    push();
    translate(contentX, contentY);
    let red = color(205, 81, 40, 200);
    let orange = color(225, 125, 19, 190);
    let yellow = color(255, 210, 0, 160);
    let gray = color(183, 178, 178, 150);

    for (let row = 0; row < unitCount; row++) {
        for (let col = 0; col < unitCount; col++) {
            // isSquare(col,row): per definire la parte dove disegnare gli elementi 
            if (isSquare(col, row)) {
                // in centro alla figura
                if (row >= -col + 6 && row < -col + 21) {
                    // N rossi (23/54 -> 42.6%) 
                    // N arancioni (17/54 -> 31.5%) 
                    //  N gialli (12/54 -> 22.2%) 
                    //  N grigi (2/54 -> 3.7%)
                    let choice = random();
                    if (choice < 0.426) {
                        stroke(red);
                    } else if (choice < (0.741)) {
                        stroke(orange);
                    } else if (choice < 0.963) {
                        stroke(yellow);
                    } else {
                        stroke(gray);
                    }
                } else {
                    // nei due vertici (in alto dx e in basso sx)
                    // N rossi (15/30 -> 50%)
                    // N arancio (13/30 ->43.3%)
                    //  N giallin (2/30 -> 6.7%)
                    let choice = random();
                    if (choice < 0.50) {
                        stroke(red);
                    } else if (choice < (0.433 + 0.5)) {
                        stroke(orange);
                    } else {
                        stroke(yellow);
                    }
                }
                drawSquare(col, row, unitSize, unitCount)
            }
        }
    }
    pop();
}

function isSquare(col, row) {
    // y = mx + q
    // row > col + q

    if (row >= col + 6) {
        // salta la parte dopo e continua il ciclo.
        return false;
    }

    if (row <= col - 6) {
        return false;
    }

    if (row >= -col + 6 && row < -col + 22) {
        // fascio di rette parallele pari:
        // row = col + q dove q deve essere pari
        if ((row - col) % 2 == 0) {
            return false;
        }
    }

    return true;
}

function drawSquare(col, row, unitSize, unitCount) {
    let centerUnitX = col * unitSize + unitSize / 2;
    let centerUnitY = row * unitSize + unitSize / 2;
    push();

    translate(centerUnitX, centerUnitY);
    // [a, a] ----> [a, b]
    // ^                 |
    // |      (0, 0)     |
    // |                 v
    // [b, a] <---- [b, b]

    // min valore di x e y del contenuto visibile dell'opera 
    let contentMinX = 0 - centerUnitX;
    let contentMinY = 0 - centerUnitY;
    // max valore di x e y del contenuto visibile dell'opera 
    let contentMaxX = unitCount * unitSize - centerUnitX;
    let contentMaxY = unitCount * unitSize - centerUnitY;

    // la dimensione massima è più piccola della unità
    let squareSize = random(unitSize * 0.6, unitSize * 0.95);
    // coordinate dei punti del singolo quadratino 
    let a = -squareSize / 2;
    let b = a + squareSize;
    // angolo di rotazione di ciascun quadratino
    let angle = random(0, 90);

    // lista dei punti che compone i vertici di ogni quadratino
    let points = [[a, a], [a, b], [b, b], [b, a]];

    // costruzione del quadratino
    for (let i = 0; i < points.length; i++) {
        let startVettore = points[i];

        let endVettore;
        if (i == points.length - 1) {
            endVettore = points[0];
        } else {
            endVettore = points[i + 1];
        }

        // nell'opera originale il disegno del quadrato si interrompe quando il tratto arriva al margine del contenuto disegnato. 
        // Per poter ottenere lo stesso risultato, è necessario applicare una trasformazione ai vettori che costruiscono il sistema di riferimento, che al momento ha orignine nel centro della singola unità (enterUnitX, centerUnitY).
        // https://en.wikipedia.org/wiki/Rotation_matrix#In_two_dimensions
        // Questa trasformazione permette di ruotare tale sistema rispetto all'anglolo di rotazione generato randomicamente, applicato al singolo elemento. 
        // In questo modo è possibile valutare se il segmento che compone il quadrato esce dal margine contenuto visibile, e trovare il punto appartenente a tale retta che interseca il margine stesso dell'opera.

        // coordinate iniziali vettore ruotato (x1, y1)
        let x1 = startVettore[0] * cos(angle) - startVettore[1] * sin(angle);
        let y1 = startVettore[0] * sin(angle) + startVettore[1] * cos(angle);
        // coordinate finali vettore ruotato (x2, y2)
        let x2 = endVettore[0] * cos(angle) - endVettore[1] * sin(angle);
        let y2 = endVettore[0] * sin(angle) + endVettore[1] * cos(angle);

        // considero l'espressione della retta passante per 2 punti 
        // per poter trovare il punto di intersezione alla retta che interseca il margine dell'opera:
        // (x - x1) / (x2 - x1) = (y - y1) / (y2 - y1)

        // se x1 è fuori dal margine sinistro trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (x1 < contentMinX) {
            let x = contentMinX;
            let y = (x - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = x
            y1 = y
        }

        // se x2 è fuori dal margine sinistro trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (x2 < contentMinX) {
            let x = contentMinX;
            let y = (x - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = x
            y2 = y
        }

        // se y1 è fuori dal margine superiore trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (y1 < contentMinY) {
            let y = contentMinY;
            let x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
            x1 = x
            y1 = y
        }

        // se y2 è fuori dal margine superiore trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (y2 < contentMinY) {
            let y = contentMinY;
            let x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
            x2 = x
            y2 = y
        }

        // se x1 è fuori dal margine destro trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (x1 > contentMaxX) {
            let x = contentMaxX;
            let y = (x - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = x
            y1 = y
        }

        // se x2 è fuori dal margine destro trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (x2 > contentMaxX) {
            let x = contentMaxX;
            let y = (x - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = x
            y2 = y
        }

        // se y1 è fuori dal margine inferiore trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (y1 > contentMaxY) {
            let y = contentMaxY;
            let x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
            x1 = x
            y1 = y
        }

        // se y2 è fuori dal margine inferiore trovo un punto sulla retta x1y1 x2y2 che sia sul margine
        if (y2 > contentMaxY) {
            let y = contentMaxY;
            let x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
            x2 = x
            y2 = y
        }

        point(x1, y1);
        point(x2, y2);
        line(x1, y1, x2, y2);
    }
    pop();
}


