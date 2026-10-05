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
  if (path == "..") {
    if (currDirectory_->parent) {
      currDirectory_ = currDirectory_->parent;
    }
    return Status::Ok;
  }
  if (path == ".") {
    return Status::Ok;
  }
  auto &children = currDirectory_->children;
  auto it = children.find(path);
  if (it == children.end()) {
    return Status::NotFound;
  }
  if (!it->second->isDirectory) {
    return Status::NotADirectory;
  }
  currDirectory_ = it->second.get();
  return Status::Ok;
}
