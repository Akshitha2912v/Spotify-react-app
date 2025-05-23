import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
  Spinner,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);

  async function search() {
    if (!searchInput.trim()) return;

    setLoading(true);
    setAlbums([]); // clear old results

    const artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    try {
      // Get Artist ID
      const artistData = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        artistParams
      ).then((res) => res.json());

      if (!artistData.artists.items.length) {
        alert("No artist found. Try another search.");
        setLoading(false);
        return;
      }

      const artistID = artistData.artists.items[0].id;
      console.log("Search Input: " + searchInput);
      console.log("Artist ID: " + artistID);

      // Get Artist Albums
      const albumData = await fetch(
        `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
        artistParams
      ).then((res) => res.json());

      // Remove duplicate albums (same name)
      const uniqueAlbums = Array.from(
        new Map(albumData.items.map((a) => [a.name, a])).values()
      );

      setAlbums(uniqueAlbums);
      setSearchInput(""); // clear input
    } catch (err) {
      console.error("Error during search:", err);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="text"
            aria-label="Search for an Artist"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            style={{
              width: "300px",
              height: "35px",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container style={{ marginTop: "20px" }}>
        {loading && (
          <div style={{ textAlign: "center", margin: "20px" }}>
            <Spinner animation="border" variant="primary" />
            <p>Loading albums...</p>
          </div>
        )}

        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                backgroundColor: "white",
                margin: "10px",
                borderRadius: "5px",
                marginBottom: "30px",
              }}
            >
              <Card.Img
                width={200}
                src={album.images[0]?.url}
                style={{
                  borderRadius: "4%",
                }}
              />
              <Card.Body>
                <Card.Title
                  style={{
                    whiteSpace: "wrap",
                    fontWeight: "bold",
                    maxWidth: "200px",
                    fontSize: "18px",
                    marginTop: "10px",
                    color: "black",
                  }}
                >
                  {album.name}
                </Card.Title>
                <Card.Text style={{ color: "black" }}>
                  Release Date: <br /> {album.release_date}
                </Card.Text>
                <Button
                  as="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={album.external_urls.spotify}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "15px",
                    borderRadius: "5px",
                    padding: "10px",
                  }}
                >
                  Album Link
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;