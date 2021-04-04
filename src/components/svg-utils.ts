export type XY = {
    x: number;
    y: number;
}

export type WH = { // Width and Height
    w: number;
    h: number;
}

type PathM = 'M' | 'm';                         // MoveTo
type PathL = 'L' | 'l' | 'H' | 'h' | 'V' | 'v'; // LineTo
type PathC = 'C' | 'c' | 'S' | 's';             // Cubic Bézier Curve
type PathQ = 'Q' | 'q' | 'T' | 't';             // Quadratic Bézier Curve
type PathA = 'A' | 'a';                         // Elliptical Arc Curve
type PathZ = 'Z' | 'z';                         // ClosePath
type PathCmd = PathM | PathL | PathC | PathQ | PathA | PathZ;

export type PathPoint = {
    c: PathCmd; //'M' | 'Q'
    d?: XY[];
}

type SvgTuple = any[]; //type SvgTuple = [PathCmd, ...number[]];

const reSpaces = '\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029';
const rePathCommand = new RegExp(`([a-z])[${reSpaces},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${reSpaces}]*,?[${reSpaces}]*)+)`, 'ig');
const rePathValues = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${reSpaces}]*,?[${reSpaces}]*`, 'ig');

export function parsePathString(pathString: string): SvgTuple[] {
    if (!pathString) {
        return [];
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

export function pathToAbsolute(pathArray: SvgTuple[]): SvgTuple[] {
    if (!pathArray || !pathArray.length) {
        return [["M", 0, 0]];
    }
    var res = [],
        x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0,
        pa0;
    if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
    }
    for (let r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push(r = []);
        pa = pathArray[i];
        pa0 = pa[0];
        if (pa0 != pa0.toUpperCase()) {
            r[0] = pa0.toUpperCase();
            switch (r[0]) {
                case "A":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +pa[6] + x;
                    r[7] = +pa[7] + y;
                    break;
                case "V":
                    r[1] = +pa[1] + y;
                    break;
                case "H":
                    r[1] = +pa[1] + x;
                    break;
                case "M":
                    mx = +pa[1] + x;
                    my = +pa[2] + y;
                default:
                    for (let j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + (j % 2 ? x : y);
                    }
            }
        } else {
            for (let k = 0, kk = pa.length; k < kk; k++) {
                r[k] = pa[k];
            }
        }
        switch (r[0]) {
            case "Z":
                x = +mx;
                y = +my;
                break;
            case "H":
                x = r[1];
                break;
            case "V":
                y = r[1];
                break;
            case "M":
                mx = r[r.length - 2];
                my = r[r.length - 1];
            default:
                x = r[r.length - 2];
                y = r[r.length - 1];
        }
    }
    return res;
}

export function pathPointsFromPath(tuples: SvgTuple[]): PathPoint[] {
    let rv = (tuples || []).map<PathPoint>(tuple => {
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
