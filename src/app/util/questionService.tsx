export default function getQuestions() {
    const statsArray: string[] = [
        // 'G',
        // 'AB',
        // 'R',
        'H',
        '2B',
        '3B',
        'HR',
        'RBI',
        'SB',
        // 'CS',
        'BB',
        'SO',
        // 'IBB',
        // 'HBP',
        // 'SH',
        // 'GIDP',
    ];

    const yearsArray: number[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022];

    var stats: string[] = [] 
    var years: number[] = []

    for (var i = 0; i < 105; i++) {
        var stat = statsArray[Math.floor(Math.random() * statsArray.length)];
        var year = yearsArray[Math.floor(Math.random() * yearsArray.length)];

        stats.push(stat)
        years.push(year)
    }

    return [years, stats]
}