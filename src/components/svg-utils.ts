export type SvgTuple = [string, number?, number?, number?, number?, number?, number?];

export function parsePathString(pathString: string): SvgTuple | undefined {
    if (!pathString) {
        return;
    }

    console.log('src', pathString);
    
    let paramCounts = {a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0};
    let data: any[] = [];

    const reSpaces = "\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029";
    const rePathCommand = new RegExp(`([a-z])[${reSpaces},]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[${reSpaces}]*,?[${reSpaces}]*)+)`, "ig");
    const rePathValues = new RegExp(`(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[${reSpaces}]*,?[${reSpaces}]*`, "ig");

    pathString.replace(rePathCommand, 
        function (a: string, b: string, c: string) {
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
        } as any
    );

    console.log('data', data);
}

parsePathString("M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34");
/*
source: 'M18,69.48s-.6-11.27-3-30.86S30.43.34,30.43.34'
data: [Array(3), Array(5), Array(5)]
    0: ["M", 18, 69.48]
    1: ["s", -0.6, -11.27, -3, -30.86]
    2: ["S", 30.43, 0.34, 30.43, 0.34]
*/
