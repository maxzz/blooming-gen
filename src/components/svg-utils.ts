export type XY = {
    x: number;
    y: number;
};

export type CXY = {
    pt: XY; // point
    cp: XY; // control point
    i: number; // SvgTuple index, as backref to SvgTuple[]
    n: string; // point command name
};

export type WH = { // Width and Height
    w: number;
    h: number;
};

/*
type PathM = 'M' | 'm';                         // MoveTo
type PathL = 'L' | 'l' | 'H' | 'h' | 'V' | 'v'; // LineTo
type PathC = 'C' | 'c' | 'S' | 's';             // Cubic Bézier Curve
type PathQ = 'Q' | 'q' | 'T' | 't';             // Quadratic Bézier Curve
type PathA = 'A' | 'a';                         // Elliptical Arc Curve
type PathZ = 'Z' | 'z';                         // ClosePath
type PathCmd = PathM | PathL | PathC | PathQ | PathA | PathZ;
*/
export type SvgTuple = any[]; //type SvgTuple = [PathCmd, ...number[]];
/*
    source: 'M18,69.48L10,20,30,40'
    data: [Array(3), Array(3), Array(3)]
        0: ["M", 18, 69.48]
        1: ["L", 10, 20]
        2: ["L", 30, 40]
    
    source: 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'
    data: [Array(3), Array(5), Array(5)]
        0: ["M", 18, 69.48]
        1: ["s", -0.6, -11.27, -3, -30.86]
        2: ["S", 30.43, 0.34, 30.43, 0.34]
*/

export function printTuples(tuplesAbs: SvgTuple[]) {
    console.log('----------------- abs tuples: -----------------', `\n${tuplesAbs.map((tuple => JSON.stringify(tuple))).join('\n')}\n-----------------`);
}

export function printCXYs(cxys: CXY[]) {
    console.log('----------------- abs tuples: -----------------', `\n${cxys.map((cxy => JSON.stringify(cxy))).join('\n')}\n-----------------`);
}

const reSpaces = '\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029';
const rePathCommand = new RegExp(`([a-z])[${reSpaces},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${reSpaces}]*,?[${reSpaces}]*)+)`, 'ig');
const rePathValues = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${reSpaces}]*,?[${reSpaces}]*`, 'ig');

export function parsePathString(pathString: string): SvgTuple[] {
    if (!pathString) {
        return [];
    }

    let paramCounts = { a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0 };
    let data: any[] = [];
    let positions: number[] = [];

    pathString.replace(rePathCommand, function (a: string, svgCmd: string, svgCmdParams: string, d: string, ofs: number, ...rest: any[]) {

        /*
            pathString.replace(rePathCommand, function (a: string, svgCmd: string, svgCmdParams: string, d: string, ofs: number, ...rest: any[]) {
                console.log(`-------------------\nofs: ${ofs}      d: '${d}' rest: '${JSON.stringify(rest)}'\n     a: '${a}'\n     b: '${svgCmd}'\n     c: '${svgCmdParams}'`); ...

            ofs: 0      d: '20    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'M20,20    '
                b: 'M'
                c: '20,20    '
                    | param ofs: 0 a: '20,' b: '20' rest: '["20,20    "]'
                    | param ofs: 3 a: '20    ' b: '20' rest: '["20,20    "]'
                    | param ofs: 9 a: '' b: '' rest: '["20,20    "]'
            -------------------
            ofs: 10      d: '100    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'Q40,20 40,100    '
                b: 'Q'
                c: '40,20 40,100    '
                    | param ofs: 0 a: '40,' b: '40' rest: '["40,20 40,100    "]'
                    | param ofs: 3 a: '20 ' b: '20' rest: '["40,20 40,100    "]'
                    | param ofs: 6 a: '40,' b: '40' rest: '["40,20 40,100    "]'
                    | param ofs: 9 a: '100    ' b: '100' rest: '["40,20 40,100    "]'
                    | param ofs: 16 a: '' b: '' rest: '["40,20 40,100    "]'
            -------------------
            ofs: 27      d: '90    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'Q70,20 80,90    '
                b: 'Q'
                c: '70,20 80,90    '
                    | param ofs: 0 a: '70,' b: '70' rest: '["70,20 80,90    "]'
                    | param ofs: 3 a: '20 ' b: '20' rest: '["70,20 80,90    "]'
                    | param ofs: 6 a: '80,' b: '80' rest: '["70,20 80,90    "]'
                    | param ofs: 9 a: '90    ' b: '90' rest: '["70,20 80,90    "]'
                    | param ofs: 15 a: '' b: '' rest: '["70,20 80,90    "]'
            -------------------
            ofs: 43      d: '100    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T 100,100    '
                b: 'T'
                c: '100,100    '
                    | param ofs: 0 a: '100,' b: '100' rest: '["100,100    "]'
                    | param ofs: 4 a: '100    ' b: '100' rest: '["100,100    "]'
                    | param ofs: 11 a: '' b: '' rest: '["100,100    "]'
            -------------------
            ofs: 56      d: '120    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T 120,120    '
                b: 'T'
                c: '120,120    '
                    | param ofs: 0 a: '120,' b: '120' rest: '["120,120    "]'
                    | param ofs: 4 a: '120    ' b: '120' rest: '["120,120    "]'
                    | param ofs: 11 a: '' b: '' rest: '["120,120    "]'
            -------------------
            ofs: 69      d: '100    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T140,100    '
                b: 'T'
                c: '140,100    '
                    | param ofs: 0 a: '140,' b: '140' rest: '["140,100    "]'
                    | param ofs: 4 a: '100    ' b: '100' rest: '["140,100    "]'
                    | param ofs: 11 a: '' b: '' rest: '["140,100    "]'
            -------------------
            ofs: 81      d: '100    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T150,100    '
                b: 'T'
                c: '150,100    '
                    | param ofs: 0 a: '150,' b: '150' rest: '["150,100    "]'
                    | param ofs: 4 a: '100    ' b: '100' rest: '["150,100    "]'
                    | param ofs: 11 a: '' b: '' rest: '["150,100    "]'
            -------------------
            ofs: 93      d: '100    ' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T160,100    '
                b: 'T'
                c: '160,100    '
                    | param ofs: 0 a: '160,' b: '160' rest: '["160,100    "]'
                    | param ofs: 4 a: '100    ' b: '100' rest: '["160,100    "]'
                    | param ofs: 11 a: '' b: '' rest: '["160,100    "]'
            -------------------
            ofs: 105      d: '100' rest: '["M20,20    Q40,20 40,100    Q70,20 80,90    T 100,100    T 120,120    T140,100    T150,100    T160,100    T170,100"]'
                a: 'T170,100'
                b: 'T'
                c: '170,100'
                    | param ofs: 0 a: '170,' b: '170' rest: '["170,100"]'
                    | param ofs: 4 a: '100' b: '100' rest: '["170,100"]'
                    | param ofs: 7 a: '' b: '' rest: '["170,100"]'
        */

        let params: any[] = [];
        let name = svgCmd.toLowerCase() as keyof typeof paramCounts;

        svgCmdParams.replace(rePathValues, function (a: string, b: string, paramOfs: number, ...rest: any[]) {
            //console.log(`        | param ofs: ${paramOfs} a: '${a}' b: '${b}' rest: '${JSON.stringify(rest)}'`);

            b && params.push(+b);
        } as any);

        if (name == "m" && params.length > 2) {
            data.push([svgCmd].concat(params.splice(0, 2)));
            name = "l";
            svgCmd = svgCmd == "m" ? "l" : "L";
        }

        if (name == "o" && params.length == 1) {
            data.push([svgCmd, params[0]]);
        }

        if (name == "r") {
            data.push([svgCmd].concat(params));
        } else {
            while (params.length >= paramCounts[name]) {
                data.push([svgCmd].concat(params.splice(0, paramCounts[name])));
                if (!paramCounts[name]) {
                    break;
                }
            }
        }
    } as any);

    return data;
}

export function pathToAbsolute(pathArray: SvgTuple[]): SvgTuple[] {
    if (!pathArray || !pathArray.length) {
        return [["M", 0, 0]];
    }
    let res = [], x = 0, y = 0, mx = 0, my = 0, start = 0, pa0;
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

export function getPoints(tuplesAbs: SvgTuple[]): XY[] {
    let rv: XY[] = [];
    let prevPos: XY = { x: 0, y: 0 };
    tuplesAbs.forEach((tuple: SvgTuple) => {
        let c = tuple[0];
        let curPos: XY;
        switch (c) { // abs path has only uppercase commands
            case 'M':
            case 'L':
            case 'T':
                curPos = { x: tuple[1], y: tuple[2] };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'H':
                curPos = { x: tuple[1], y: prevPos.y };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'V':
                curPos = { x: prevPos.x, y: tuple[1] };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'C':
                curPos = { x: tuple[5], y: tuple[6] };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'S':
            case 'Q':
                curPos = { x: tuple[3], y: tuple[4] };
                rv.push(curPos);
                prevPos = curPos;
                break;
            case 'A':
                curPos = { x: tuple[6], y: tuple[7] };
                rv.push(curPos);
                prevPos = curPos;
                break;
        }
    });
    return rv;
}

function endPointOfs(tuple: SvgTuple): number | undefined {
    // TODO: still not covered some cases and marked as 0.
    let endPointOffsets = { a: 6, c: 5, o: 0, h: 0, l: 1, m: 1, r: 0, q: 3, s: 3, t: 1, v: 0, u: 0, z: 0 };
    return endPointOffsets[tuple[0].toLowerCase() as keyof typeof endPointOffsets];
}

export function getControlPoints(tuplesAbs: SvgTuple[]): CXY[] {
    let rv: CXY[] = [];
    let prevPos: XY = { x: 0, y: 0 };
    let endPoints: XY[] = []; // End points history
    let prevTuple: SvgTuple;

    //TODO: function getPrevStartPoint(type: 'C' | 'S' | 'Q' | 'T', index: number): XY {}

    tuplesAbs.forEach((tuple: SvgTuple, index: number, items: SvgTuple[]) => {
        let c = tuple[0];
        let curPos: XY = { x: 0, y: 0 };
        switch (c) { // abs path has only uppercase commands
            case 'M':
            case 'L':
                curPos = { x: tuple[1], y: tuple[2] };
                break;
            case 'H':
                curPos = { x: tuple[1], y: prevPos.y };
                break;
            case 'V':
                curPos = { x: prevPos.x, y: tuple[1] };
                break;
            case 'C':
                curPos = { x: tuple[5], y: tuple[6] };
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[1], y: tuple[2] } });
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[3], y: tuple[4] } });
                break;
            case 'S': {
                curPos = { x: tuple[3], y: tuple[4] };
                switch (prevTuple[0]) {
                    case 'C':
                    case 'S':
                        let ofs = prevTuple[0] === 'C' ? 3 : 1;
                        let prevCtrl: XY = { x: prevPos.x - (prevTuple[ofs] - prevTuple[ofs + 2]), y: prevPos.y - (prevTuple[ofs + 1] - prevTuple[ofs + 3]) }; // reflection
                        rv.push({ i: index, n: c, pt: prevPos, cp: prevCtrl });
                        break;
                }
                rv.push({ i: index, n: c, pt: curPos, cp: { x: tuple[1], y: tuple[2] } });
                break;
            }
            case 'Q':
                curPos = { x: tuple[3], y: tuple[4] };
                let cp: XY = { x: tuple[1], y: tuple[2] };
                rv.push({ i: index, n: c, pt: prevPos, cp: cp });
                rv.push({ i: index, n: c, pt: curPos, cp: cp });
                break;
            case 'T': {
                function backtrackCP(i: number, cp: XY): XY {
                    let prev = items[i - 1];
                    if (!prev) {
                        return cp;
                    }
                    if (prev[0] === 'Q') { // Q, x1, y1, x, y
                        return {
                            x: cp.x + (-prev[1] + cp.x),
                            y: cp.y + (-prev[2] + cp.y),
                        };
                    }
                    if (prev[0] === 'T') { // T, x, y
                        let prevToPrevPos: XY = { x: 0, y: 0 };

                        let prevToPrev = items[i - 2];
                        if (prevToPrev) {
                            let ofs = endPointOfs(prevToPrev);
                            if (ofs) {
                                prevToPrevPos = { x: prevToPrev[ofs], y: prevToPrev[ofs + 1] };
                            }
                        }

                        let prevCP = backtrackCP(i - 1, prevToPrevPos);
                        return {
                            x: 2 * cp.x - prevCP.x,
                            y: 2 * cp.y - prevCP.y,
                        };
                    }
                    return cp;
                }
                let cp: XY = backtrackCP(index, prevPos);

                curPos = { x: tuple[1], y: tuple[2] };
                rv.push({ i: index, n: c, pt: prevPos, cp: cp });
                rv.push({ i: index, n: c, pt: curPos, cp: cp });
                break;
            }
            case 'A':
                //rv.push({ i: index, x: tuple[1], y: tuple[2] });
                curPos = { x: tuple[6], y: tuple[7] };
                break;
        }
        endPoints.push(prevPos = curPos);
        prevTuple = tuple;
    });
    return rv;
}
