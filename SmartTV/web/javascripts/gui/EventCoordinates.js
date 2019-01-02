class EventCoordinates {
    constructor() {

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