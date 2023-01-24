import { 
  useEffect, 
  useState 
} from 'react';
import eggwin from './eggwin.png';
import './App.css';

interface RankInfo {
  tag: string;
  code: string;
  rank: string;
  elo: number;
  wins: number;
  losses: number;
  characters: string[];
}

const convertElo = (elo: number): string => {
  if (elo < 766) return "Bronze 1";
  if (elo < 914) return "Bronze 2";
  if (elo < 1055) return "Bronze 3";
  if (elo < 1189) return "Silver 1";
  if (elo < 1316) return "Silver 2";
  if (elo < 1436) return "Silver 3";
  if (elo < 1549) return "Gold 1";
  if (elo < 1654) return "Gold 2";
  if (elo < 1752) return "Gold 3";
  if (elo < 1843) return "Platinum 1";
  if (elo < 1928) return "Platinum 2";
  if (elo < 2004) return "Platinum 3";
  if (elo < 2074) return "Diamond 1";
  if (elo < 2137) return "Diamond 2";
  if (elo < 2192) return "Diamond 3";
  if (elo < 2275) return "Master 1";
  if (elo < 2350) return "Master 2";
  return "Master 3 or Grandmaster";
};

const getRankInfo = (code: string): Promise<RankInfo> => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "operationName": "AccountManagementPageQuery",
        "variables": { "cc": code,"uid": code },
        "query": "fragment userProfilePage on User {\n  fbUid\n  displayName\n  connectCode {\n    code\n    __typename\n  }\n  status\n  activeSubscription {\n    level\n    hasGiftSub\n    __typename\n  }\n  rankedNetplayProfile {\n    id\n    ratingOrdinal\n    ratingUpdateCount\n    wins\n    losses\n    dailyGlobalPlacement\n    dailyRegionalPlacement\n    continent\n    characters {\n      id\n      character\n      gameCount\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\n  getUser(fbUid: $uid) {\n    ...userProfilePage\n    __typename\n  }\n  getConnectCode(code: $cc) {\n    user {\n      ...userProfilePage\n      __typename\n    }\n    __typename\n  }\n}\n"
      }),
    };
    fetch("https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql", requestOptions)
      .then(response => response.json())
      .then((data) =>  {
        const elo = Math.round(data.data.getConnectCode.user.rankedNetplayProfile.ratingOrdinal);
        const characters = data.data.getConnectCode.user.rankedNetplayProfile.characters.length !== 0 ?
          data.data.getConnectCode.user.rankedNetplayProfile.characters.map((c: any) => c.character) : [];
        const rankInfo: RankInfo = {
          tag: data.data.getConnectCode.user.displayName,
          code,
          rank: convertElo(elo),
          elo,
          wins: data.data.getConnectCode.user.rankedNetplayProfile.wins ?? 0,
          losses: data.data.getConnectCode.user.rankedNetplayProfile.losses ?? 0,
          characters,
        };
        resolve(rankInfo);
      })
      .catch(error => reject(error));
  });

};

const getRankClass = (elo: number): string => {
  if (elo < 1055) return "bronze";
  if (elo < 1436) return "silver";
  if (elo < 1752) return "gold";
  if (elo < 2004) return "plat";
  if (elo < 2192) return "diamond";
  return "master";
}

const gamers = [
  "SKAHT#0", 
  "EDWIN#0", 
  "PETE#653", 
  "EBEN#786", 
  "SUPA#776", 
  "NGFM#267",
  "YARN#567",
  "PAYC#938",
];

function App() {
  

  const [ranks, setRanks] = useState<RankInfo[]>();
  const [searchedRank, setSearchedRank] = useState<RankInfo>();
  const [error, setError] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const getRanks = async () => {
    const ranks = await Promise.all(gamers.map(getRankInfo));
    ranks.sort((a, b) => b.elo - a.elo);
    setRanks(ranks);
  };

  const onSearch = async () => {
    setSearchedRank(undefined);
    setError(false);
    try {
      const rankInfo: RankInfo = await getRankInfo(inputValue);
      setSearchedRank(rankInfo);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (ranks === undefined) {
      getRanks();
    }
  }, [ranks]);

  if (ranks === undefined) return (
    <div className="App">
      <header className="App-header">
        <img src={eggwin} className="App-logo" alt="logo" />
        <p>
          Loading...
        </p>
      </header>
    </div>
  );

  return (
    <div className="App">
    <header className="App-header">
      <div className="title">Epic Ranked Momes!</div>
      <div className="updated">Updated {new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            <th>Gamer</th>
            <th>Rank</th>
            <th>Elo</th>
            <th>W/L</th>
            {/* <th>Characters</th> */}
          </tr>
        </thead>
        <tbody>
          {ranks.map(rankInfo => {
            return (
              <tr key={rankInfo.code}>
                <td>
                  <div>{ rankInfo.tag }</div>
                  <div className="playerCode">{ rankInfo.code }</div>
                </td>
                <td className={getRankClass(rankInfo.elo)}>{ rankInfo.rank }</td>
                <td>{ rankInfo.elo }</td>
                <td><span className="wins">{ rankInfo.wins }</span>/<span className="losses">{ rankInfo.losses }</span></td>
                {/* <td>{ rankInfo.characters.length > 0 ? rankInfo.characters.join(", ") : "N/A" }</td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </header>
  </div>
  );
}

export default App;
