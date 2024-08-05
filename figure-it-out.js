export const FIOSolver = function(properties){
    this.properties = properties;
    this.N = this.properties.length;
    this.Ms = this.properties.map(p => p.values.length);
    this.totalCards = this.Ms.reduce((a, b) => a * b, 1);
    this.generateCards = function(cardIndex = 0){
        if (cardIndex >= this.N){
            return [[]];
        } 
        const cards = [];
        for (let i = 0; i < this.Ms[cardIndex]; i++){
            const subCards = this.generateCards(cardIndex + 1);
            for (let j = 0; j < subCards.length; j++){
                cards.push([i, ...subCards[j]]);
            }
        }
        return cards;
    };
    this.allGuesses = this.generateCards();
    this.viableCards = [...this.allGuesses];
    this.evaluateSimilarities = function(guess){
        const out = [];
        for (const o of this.viableCards){
            let count = 0;
            for (let i = 0; i < this.N; i++){
                if (o[i] === guess[i]){
                    count++;
                }
            }
            out.push(count);
        }
        return out;
    }
    this.getGuessExpInfo = function(guess){
        const similarities = this.evaluateSimilarities(guess);
        const counts = {};
        for (let i = 0; i <= this.N; i++){
            counts[i] = 0;
        }
        for (const s of similarities){
            counts[s]++;
        }
        let out = 0;
        for (let i = 0; i <= this.N; i++){
            const p = counts[i] / this.viableCards.length;
            if (p === 0){
                continue;
            }
            out += p * Math.log2(p);
        }
        return -out;
    }
    this.getGuess = function(){
        if (this.viableCards.length === 1){
            return this.viableCards[0];
        }
        let maxExpInfo = -Infinity;
        let bestGuess = null;
        for (const guess of this.allGuesses){
            const expInfo = this.getGuessExpInfo(guess);
            if (expInfo > maxExpInfo){
                maxExpInfo = expInfo;
                bestGuess = guess;
            }
        }
        return bestGuess;
    }
    this.updateViableCards = function(guess, correctProperties){
        this.viableCards = this.viableCards.filter(card => {
            let correctCount = 0;
            for (let i = 0; i < this.N; i++){
                if (card[i] === guess[i]){
                    correctCount++;
                }
            }
            return correctCount === correctProperties;
        });
    };
}
export const FIOGame = function(properties, answerString){
    this.properties = properties;
    this.N = this.properties.length;
    this.Ms = this.properties.map(p => p.values.length);
    this.answerString = answerString;
    this.answer = this.answerString.map((v, i) => this.properties[i].values.indexOf(v));
    this.calculateSimilarity = function(guess){
        let count = 0;
        for (let i = 0; i < this.N; i++){
            if (this.answer[i] === guess[i]){
                count++;
            }
        }
        return count;
    }
};