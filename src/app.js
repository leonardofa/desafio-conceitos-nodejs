const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).send({ message: "Invalid repository ID." });
  }
  next();
}

function validateRepositoryExists(request, response, next) {
  const { id } = request.params;

  const index = repositories.findIndex((repository) => repository.id === id);
  if (index < 0) {
    return response.status(400).send({ message: "Repository not found" });
  }

  request.repositoryIndex = index;
  request.repository = repositories[index];

  next();
}

app.use("/repositories/:id", validateRepositoryId, validateRepositoryExists);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  if (title == undefined) {
    return response.status(400).send({ message: "title is required" });
  }

  if (url == undefined) {
    return response.status(400).send({ message: "url is required" });
  }

  if (techs == undefined || techs.length == 0 || !Array.isArray(techs))  {
    return response.status(400).send({ message: "techs is required" });
  }

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { repository } = request;

  if (title != undefined) {
    repository.title = title;
  }

  if (url != undefined) {
    repository.url = url;
  }

  if (techs != undefined && techs.length > 0 && Array.isArray(techs))  {
    repository.techs = techs;
  }

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request;
  repositories.splice(repositoryIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repository } = request;
  repository.likes++;
  return response.json({likes: repository.likes});
});

module.exports = app;
