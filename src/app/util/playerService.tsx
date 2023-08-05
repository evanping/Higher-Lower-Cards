import data from '../../data/data-qualified-hitters-4.json'
// import data from '../../data/data-test.json'

function shuffle(array: object[]) {
    array.sort(() => Math.random() - 0.5);
  }

// Retreive array of 20 players (for 10 questions)
// const allPlayers: Object[] = [
//     {id: '1', name: 'Mike Trout', image: 'https://www.sportsnet.ca/wp-content/uploads/2023/07/Los-Angeles-Angels-Mike-Trout.jpg'},
//     {id: '2', name: 'Miguel Cabrera', image: 'https://www.si.com/.image/t_share/MTgzMzM2ODA0OTk1MzEwNjMw/miguel-cabrera-tigers.jpg'},
//     {id: '3', name: 'Jed Lowrie', image: 'https://img.mlbstatic.com/mlb-images/image/private/t_16x9/t_w1024/mlb/y9uwtfe8nrw6enftft3g'},
//     {id: '4', name: 'Evan Longoria', image: 'https://cdn.vox-cdn.com/thumbor/zyyK6tJoACJZVKtaTXQyWinKvqs=/0x0:3000x1940/1200x800/filters:focal(1260x730:1740x1210)/cdn.vox-cdn.com/uploads/chorus_image/image/62957090/127538087.jpg.0.jpg'},
//     {id: '5', name: 'Evan Longoria', image: 'https://cdn.vox-cdn.com/thumbor/zyyK6tJoACJZVKtaTXQyWinKvqs=/0x0:3000x1940/1200x800/filters:focal(1260x730:1740x1210)/cdn.vox-cdn.com/uploads/chorus_image/image/62957090/127538087.jpg.0.jpg'},
//     {id: '6', name: 'Evan Longoria', image: 'https://cdn.vox-cdn.com/thumbor/zyyK6tJoACJZVKtaTXQyWinKvqs=/0x0:3000x1940/1200x800/filters:focal(1260x730:1740x1210)/cdn.vox-cdn.com/uploads/chorus_image/image/62957090/127538087.jpg.0.jpg'},
// ]


export default function getPlayers(years: Array<number>) {
    // const allPlayers: Object[] = selectRandomItems(indices)
    // const allPlayers = data.splice(index, index + 20)
    let arr = data
    let allPlayers: Array<any> = []
    
    // shuffle(arr)
    // const allPlayers = arr.splice(0, 22)

    for (var i = 0; i < years.length; i++) {
        var relevantPlayers: Array<any> = arr.filter(playerYear => playerYear.yearID === years[i])
        shuffle(relevantPlayers)
        allPlayers.push(relevantPlayers.splice(0, 2))
    }

    return allPlayers;
}