/** Name:   Utils.ToastR.Js
 *  Desc:   Utilities used within ToastR game
 *  Author: Jimy Houlbrook
 *  Date:   02/11/22
 */

/** AABB collision to check if objects are within eachother
 * 
 * @param {object} elem1 
 * @param {object} elem2 
 * @returns boolean
 */
export function isWithin(elem1, elem2){
    const a = elem1.getBounds();
    const b = elem2.getBounds();

    // If a is within b return true
    return a.x < b.x + b.width
        && a.x + a.width > b.x
        && a.y < b.y + b.height
        && a.y + a.height > b.y
}