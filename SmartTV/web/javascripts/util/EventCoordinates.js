

class EventCoordinates {
    constructor() {

    }

    /**
     * Returns documentXY coordinates. Returns null on invalid input.
     * Multiple touches are invalid input unless averageTouches are true
     * @param {MouseEvent|TouchEvent} event
     * @param {boolean} averageTouches if true, multiple touches are averaged to one point
     * @returns {[number, number]|null}
     */
    static GetXYCoordinates(event, averageTouches=false) {
        if (event instanceof MouseEvent) {
            return [event.pageX, event.pageY];
        }
        else if (event instanceof TouchEvent) {
            if (event.touches.length == 1) {
                return [event.touches[0].pageX, event.touches[0].pageY];
            }
            else if (averageTouches) {
                const sums = [0, 0];
                let cnt = 0;
                for (const touch of event.touches) {
                    sums[0] += event.touches[0].pageX;
                    sums[1] += event.touches[1].pageX;
                    ++cnt;
                }
                return [sums[0] / cnt, sums[1] / cnt];
            }
        }
        return null;
    }

    /**
     * 
     * @param {MouseEvent|TouchEvent} event
     * @returns {{x:number,y:number}}
     */
    static getCoords(event) {
        if (typeof TouchEvent != "undefined" && event instanceof TouchEvent) {
            return {
                x: event.touches[0].clientX, y: event.touches[0].clientY
            };
        }
        else if (event instanceof MouseEvent) {
            return { x: event.clientX, y: event.clientY };
        }
    }
}

export default EventCoordinates;