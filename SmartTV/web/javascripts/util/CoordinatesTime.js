class CoordinatesTime {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.time = new Date().getTime();
    }
}

export default CoordinatesTime;