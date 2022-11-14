/** Name:   Utils.ToastR.Js
 *  Desc:   Utilities used within ToastR game
 *  Author: Jimy Houlbrook
 *  Date:   02/11/22
 */

export class Utilities{
    /** AABB collision to check if objects are within eachother
     * 
     * @param {object} elem1 
     * @param {object} elem2 
     * @returns boolean
     */
    static isWithin(elem1, elem2){
        // Exit function if elements are null
        if(!elem1 || !elem2)
            return false;
        
        // Dev tool: tell which elem is null
        // if(!elem1){
        //     console.error(`ERR: elem1 is null`);
        //     return;
        // } else if(!elem2){
        //     console.error(`ERR: elem2 is null`);
        //     return;
        // }

        const a = elem1.getBounds();
        const b = elem2.getBounds();

        // If a is within b return true
        return a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y;
    }

    /** Check and update score of the game
     * 
     * @param {Bread} bread Bread object in game 
     * @param {Order} order Order objcet in game
     * @returns             Object containing score and if player has "failed"
     */
    static checkScore(bread, order){
        if(!bread || !order)
            return false;

        let toReturn = {
            score: 0,
            failure: false
        }
        
        if(`bread${bread.state}` == order.bread.ID)
            toReturn.score += 80;
        else if(`bread${bread.state + 1}` == order.bread.ID 
        || `bread${bread.state - 1}` == order.bread.ID)
            toReturn.score += 40;
        else
            toReturn.failure = true;


        if(bread.property == order.spread.ID)
            toReturn.score += 40;
        else
            toReturn.failure = true;

        if(toReturn.failure)
            toReturn.score = 0;

        return toReturn
    }

    /** Update the text of a pixi text element
     * 
     * @param {PIXI.Text}   textElem  Text element to be changed 
     * @param {string}      newText   New text for text element   
     * @returns                       Text elem with changes made
     */
    static updateText(textElem, newText){
        if(!textElem || !newText)
            return false;
        
        textElem.text = newText;
        textElem.x = (0 + textElem.width / 2);
        return textElem;
    }

    /** Change chance indicator from dark to light
     * 
     * @param {Number}          chances             How many chances the player has
     * @param {Array}           chanceIndicators    Array containing chance indicator objects
     * @param {Loader.resource} texture             Texture to change them too 
     * @returns chances
     */
    static changeChanceIndicator(chanceIndicators, texture, chances){
        if(chances){
            chances -= 1
            if(chances >= 0) chanceIndicators[chances].texture = texture
            return chances
        }

        for(const indicator of chanceIndicators)
            indicator.texture = texture;

        return 3;
    }
}

