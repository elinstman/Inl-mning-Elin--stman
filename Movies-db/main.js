import mongoose, { connect } from "mongoose";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  await mongoose.connect("mongodb://localhost:27017/elin-assignment-db");

  const movieSchema = mongoose.Schema({
    title: { type: String },
    director: { type: String },
    releaseYear: { type: Number },
    genres: { type: [String] },
    ratings: { type: [Number] },
    cast: { type: [String] },
  });

  const movieModel = mongoose.model("movies", movieSchema);

  let running = true;

  async function showMenu() {
    console.log("Meny");
    console.log("1. Visa alla filmer");
    console.log("2. Lägg till en film");
    console.log("3. Uppdatera en film");
    console.log("4. Radera en film");
    console.log("5. Avsluta");
    await askOption();
  }

  async function askOption() {
    rl.question("Välj ett alternativ: ", async (input) => {
      switch (input.trim()) {
        case "1":
          try {
            const allMovies = await movieModel.find({});
            console.log("\nAlla Filmer:");
            allMovies.forEach((movie) => console.log(movie));
          } catch (error) {
            console.error("Ett fel uppstod:", error);
          }
          await showMenu();
          break;
        case "2":
          await addMovie();
          break;
        case "3":
          await updateMovie();
          break;
        case "4":
          await deleteMovie();
          break;
        case "5":
          console.log("Avslutar...");
          running = false;
          rl.close();
          mongoose.disconnect();
          console.log("Appen är stängd.");
          console.log("Ange node index.js för att öppna menyn på nytt.");
          break;
        default:
          console.log("Ogiltigt val. Välj ett nummer mellan 1 och 5.");
          await askOption();
      }
    });
  }

  async function addMovie() {
    rl.question("Vad heter filmen? ", async (title) => {
      rl.question("Vem har regisserat filmen? ", async (director) => {
        rl.question("Ange realesedatum: ", async (releaseYear) => {
          rl.question(
            "Vilken/Vilken genre tillhör filmen? ",
            async (genres) => {
              rl.question("Vilken rating har filmen? ", async (ratings) => {
                rl.question(
                  "Vilka skådespelare har huvudrollerna? ",
                  async (cast) => {
                    try {
                      let newMovie = await movieModel.create({
                        title: title,
                        director: director,
                        releaseYear: releaseYear,
                        genres: genres,
                        ratings: ratings,
                        cast: cast,
                      });
                      console.log("Din film har lagts till!", newMovie);
                      await showMenu();
                    } catch (error) {
                      console.log("Ett fel uppstod.", error);
                    }
                  }
                );
              });
            }
          );
        });
      });
    });
  }

  async function updateMovie() {
    rl.question(
      "Ange titel på den film du vill uppdatera. (OBS. upper/lowercase känslig) :",
      async (searchTitle) => {
        try {
          const choosenMovie = await movieModel.findOne({ title: searchTitle });
          if (!choosenMovie) {
            console.log("Felstavat/Finns tyvärr inte i databasen.");
            await showMenu();
          } else {
            console.log("Din valda film:");
            console.log(choosenMovie);
            rl.question("Välj en ny titel: ", async (newTitle) => {
              rl.question("Välj ny regissör: ", async (newDirector) => {
                rl.question("Ange nytt releaseår: ", async (newReleaseYear) => {
                  try {
                    choosenMovie.title = newTitle;
                    choosenMovie.director = newDirector;
                    choosenMovie.releaseYear = newReleaseYear;
                    await choosenMovie.save();
                    console.log("Uppgifterna har sparats.");
                    await showMenu();
                  } catch (error) {
                    console.log("Ett fel uppstod", error);
                  }
                });
              });
            });
          }
        } catch (error) {
          console.log("Ett fel uppstod.", error);
          await showMenu();
        }
      }
    );
  }

  async function askYesNo(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim().toLowerCase() === "ja");
      });
    });
  }

  async function deleteMovie() {
    rl.question(
      "Ange titeln på den film du vill radera. (OBS. upper/lowercase känslig) :",
      async (searchTitle) => {
        try {
          const movieToDelete = await movieModel.findOne({
            title: searchTitle,
          });
          if (!movieToDelete) {
            console.log("Felstavat/finns inte i databasen.");
            await showMenu();
          } else {
            console.log("Vald film:");
            console.log(movieToDelete);
            const confirmDelete = await askYesNo(
              "Är du säker på att du vill radera denna film? (ja/nej): "
            );
            if (confirmDelete) {
              await movieToDelete.deleteOne();
              console.log("FILMEN HAR RADERATS FRÅN DATABASEN!");
              await showMenu();
            } else {
              console.log("Radering avbruten.");
              await showMenu();
            }
          }
        } catch (error) {
          console.log("Ett fel uppstod.", error);
          await showMenu();
        }
      }
    );
  }

  await showMenu();
}

main();
