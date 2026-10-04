#include "fs.h"

FileSystem::FileSystem()
    : root_(std::make_unique<Node>(true, "")), currDirectory_(root_.get()) {}

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

std::string FileSystem::pwd() const { return getPath(currDirectory_); }
