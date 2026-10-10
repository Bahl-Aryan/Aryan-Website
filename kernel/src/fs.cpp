#include "fs.h"

// Constructor
FileSystem::FileSystem()
    : root_(std::make_unique<Node>(true, "")), currDirectory_(root_.get()) {}

// Private Methods
std::string FileSystem::getPath(const Node *node) {
  if (!node->parent) {
    return "/";
  }
  std::string path;
  while (node->parent) {
    path = "/" + node->name + path; // put the name in front
    node = node->parent;            // move up to the parent
  }
  return path;
}

bool FileSystem::isValidName(const std::string &name) {
  if (name.empty() || name.find('/') != std::string::npos || name == "." ||
      name == "..") {
    return false;
  }
  return true;
}

Node *FileSystem::resolve(const std::string &path) const {
  Node *currNode = nullptr;
  if (!path.empty() && path[0] == '/') {
    currNode = root_.get();
  } else {
    currNode = currDirectory_;
  }

  auto pieces = splitPath(path);
  for (const auto &piece : pieces) {
    if (!currNode->isDirectory) {
      return nullptr;
    }
    if (piece == "..") {
      if (currNode->parent) {
        currNode = currNode->parent;
      }
      continue;
    }
    if (piece == ".") {
      continue;
    }
    auto &children = currNode->children;
    auto it = children.find(piece);
    if (it == children.end()) {
      return nullptr;
    }
    currNode = it->second.get();
  }
  return currNode;
}

std::vector<std::string> FileSystem::splitPath(const std::string &path) {
  // take a string like 'a/b/c' and split it into the different pieces
  std::vector<std::string> res;
  std::string piece;
  for (char c : path) {
    if (c == '/') {
      if (!piece.empty()) {
        res.push_back(std::move(piece));
      }
      piece.clear();
    } else {
      piece += c;
    }
  }
  if (!piece.empty()) {
    res.push_back(std::move(piece));
  }
  return res;
}

// Public Methods
std::string FileSystem::pwd() const { return getPath(currDirectory_); }

std::vector<std::string> FileSystem::ls() const {
  std::vector<std::string> res;
  for (const auto &[name, child] : currDirectory_->children) {
    if (child->isDirectory) {
      res.push_back(name + "/");
    } else {
      res.push_back(name);
    }
  }
  return res;
}

Status FileSystem::mkdir(const std::string &name) {
  if (!isValidName(name)) {
    return Status::InvalidName;
  }
  auto &children = currDirectory_->children;
  auto node = std::make_unique<Node>(true, name);
  // try_emplace returns false if key exists in children alr
  // can use that to return AlreadyExists instead of .count on map
  auto [it, success] = children.try_emplace(name, std::move(node));
  if (!success) {
    return Status::AlreadyExists;
  }
  it->second->parent = currDirectory_;
  return Status::Ok;
}

Status FileSystem::cd(const std::string &path) {
  if (path.empty()) {
    return Status::InvalidName;
  }
  Node *node = resolve(path);
  if (!node) {
    return Status::NotFound;
  }
  if (!node->isDirectory) {
    return Status::NotADirectory;
  }
  currDirectory_ = node;
  return Status::Ok;
}
