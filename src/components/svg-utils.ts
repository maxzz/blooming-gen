export type XY = {
    x: number;
    y: number;
}

export type WH = { // Width and Height
    w: number;
    h: number;
}

export type PathPoint = {
    c: PathCmd; //'M' | 'Q'
    d?: XY[];
}

type SvgTuple = [PathCmd, ...number[]];

type PathM = 'M' | 'm';                         // MoveTo
type PathL = 'L' | 'l' | 'H' | 'h' | 'V' | 'v'; // LineTo
type PathC = 'C' | 'c' | 'S' | 's';             // Cubic Bézier Curve
type PathQ = 'Q' | 'q' | 'T' | 't';             // Quadratic Bézier Curve
type PathA = 'A' | 'a';                         // Elliptical Arc Curve
type PathZ = 'Z' | 'z';                         // ClosePath

type PathCmd = PathM | PathL | PathC | PathQ | PathA | PathZ;

const reSpaces = '\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029';
const rePathCommand = new RegExp(`([a-z])[${reSpaces},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${reSpaces}]*,?[${reSpaces}]*)+)`, 'ig');
const rePathValues = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${reSpaces}]*,?[${reSpaces}]*`, 'ig');

function parsePathString(pathString: string): SvgTuple[] | undefined {
    if (!pathString) {
        return;
    }

    let paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0};
    let data: any[] = [];

    pathString.replace(rePathCommand, function (a: string, b: string, c: string) {
        let params: any[] = [];
        let name = b.toLowerCase() as keyof typeof paramCounts;

        c.replace(rePathValues, function (a: string, b: string) {
            b && params.push(+b);
        } as any);

        if (name == "m" && params.length > 2) {
            data.push([b].concat(params.splice(0, 2)));
            name = "l";
            b = b == "m" ? "l" : "L";
        }

        if (name == "o" && params.length == 1) {
            data.push([b, params[0]]);
        }

        if (name == "r") {
            data.push([b].concat(params));
        } else {
            while (params.length >= paramCounts[name]) {
                data.push([b].concat(params.splice(0, paramCounts[name])));
                if (!paramCounts[name]) {
                    break;
                }
            }
        }
    } as any);

    /*
        console.log('source:', pathString);
            // source: 'M18,69.48L10,20,30,40'
            // data: [Array(3), Array(3), Array(3)]
            //     0: ["M", 18, 69.48]
            //     1: ["L", 10, 20]
            //     2: ["L", 30, 40]
        console.log('data:', data);
            // source: 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'
            // data: [Array(3), Array(5), Array(5)]
            //     0: ["M", 18, 69.48]
            //     1: ["s", -0.6, -11.27, -3, -30.86]
            //     2: ["S", 30.43, 0.34, 30.43, 0.34]
    */

    return data;
}

export function pathPointsFromPath(pathString: string): PathPoint[] {
    const tuples = parsePathString(pathString);
    if (!tuples) {
        return [];
    }
    let rv = tuples.map<PathPoint>(tuple => {
        let c = tuple[0];
        let xy: XY[] = [];
        for (let i = 1; i < tuple.length; i+=2) {
            xy.push({x: tuple[i] as number, y: tuple[i+1] as number || 0});
        }
        if (c === 'v' || c === 'V') {
            xy = [{x: 0, y: xy[0].x}];
        }
        return {c, d: xy };
    });
    return rv;
}

/*
type PathM = 'M' | 'm';                         // MoveTo
type PathL = 'L' | 'l' | 'H' | 'h' | 'V' | 'v'; // LineTo
type PathC = 'C' | 'c' | 'S' | 's';             // Cubic Bézier Curve
type PathQ = 'Q' | 'q' | 'T' | 't';             // Quadratic Bézier Curve
type PathA = 'A' | 'a';                         // Elliptical Arc Curve
type PathZ = 'Z' | 'z';                         // ClosePath
*/

const lowerCase = String.prototype.toLowerCase;

function getPrevPos(point: PathPoint, prevPos: XY): XY {
    if (!point.d) {
        return prevPos;
    }
    if (!prevPos) {
        prevPos = {x:0, y:0};
    }
    if (point.c != lowerCase.call(point.c)) {
        switch (lowerCase.call(point.c)) {
            case 'm':
            case 'l': return {x: point.d[0].x + prevPos.x, y: point.d[0].y + prevPos.y};
            case 'h': return {x: point.d[0].x + prevPos.x, y: point.d[0].y + prevPos.y};
        }
    } else {
        switch (point.c) {
            case 'M':
            case 'L': return point.d[0];
            case 'H': return {x: point.d[0].x, y: prevPos.y};
        }
    }
    return prevPos;
}

function relativeToAbsPos(pathPoints: PathPoint[]): PathPoint[] {
    let prevPos: XY | undefined;
    return pathPoints.map((point) => {

        let thisPos: XY | undefined;
        if (point.d) {
            if (point.c === 'M') {
                thisPos = point.d[0];
            } else if (point.c === 'm') {
                thisPos = prevPos ? {x: prevPos.x + point.d[0].x, y: prevPos.y + point.d[0].y} : point.d[0];
            } else if (point.c === 'Q') {
                thisPos = point.d[1];
            } else if (point.c === 'q') {
                thisPos = prevPos ? {x: prevPos.x + point.d[1].x, y: prevPos.y + point.d[1].y} : point.d[1];
            }
        }

        //TODO: set initial {x:0, y:0}
        //case on point.c
        //separete function give prev and get current

        if (point.c > 'Z' && prevPos) { // i.e. lowercase command
            //let prevPos = 
        }

        prevPos = thisPos;
        
        return {c: point.c};
    });
}