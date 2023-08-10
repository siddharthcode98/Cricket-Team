const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`Db Error ${e.message}`);
    process.exit(1);
  }
};
initializeServerAndDB();

// Get List of All Players
app.get("/players/", async (request, response) => {
  const getAllPlayersList = `SELECT * FROM cricket_team;`;
  const playersList = await db.all(getAllPlayersList);
  const finalArray = playersList.map((eachPlayer) => {
    return {
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_number,
      role: eachPlayer.role,
    };
  });
  response.send(finalArray);
});
// POST a new player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createANewPlayer = `INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES
      (
         '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;
  await db.run(createANewPlayer);
  response.send("Player Added to Team");
});
// Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id= ${playerId}`;
  const player = await db.get(getPlayer);
  let finalOb = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  };
  response.send(finalOb(player));
});

//Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `UPDATE cricket_team 
  SET
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE
  player_id=${playerId}`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `DELETE FROM cricket_team WHERE player_id= ${playerId}`;
  await db.run(deletePlayerDetails);
  response.send("Player Removed");
});

module.exports = app;
