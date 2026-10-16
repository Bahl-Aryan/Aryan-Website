#include "fs.h"
#include "config.h"
#include <algorithm>

// FileSystem Constructor
FileSystem::FileSystem()
    : root_(std::make_unique<Node>(true, "")), currDirectory_(root_.get()) {}

// Node Destructor
Node::~Node() {
  std::vector<std::unique_ptr<Node>> nodes;
  for (auto &[childName, child] : children) {
    nodes.push_back(std::move(child));
  }
  children.clear();
  while (!nodes.empty()) {
    std::unique_ptr<Node> curr = std::move(nodes.back());
    nodes.pop_back();
    for (auto &[childName, child] : curr->children) {
      nodes.push_back(std::move(child));
    }
    curr->children.clear();
  }
}

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
      name == ".." || name.size() > Config::MAX_FILENAME_LENGTH) {
    return false;
  }
  return true;
}

Node *FileSystem::resolve(const std::string &path) const {
  auto currNode = getStartNodeFor(path);
  auto pieces = splitPath(path);
  return walkPath(currNode, pieces);
}

Status FileSystem::resolveParent(const std::string &path, Node *&parent,
                                 std::string &name) const {
  auto pieces = splitPath(path);
  if (pieces.empty()) {
    return Status::InvalidName;
  }
  std::string newName = std::move(pieces.back());
  if (!isValidName(newName)) {
    return Status::InvalidName;
  }
  pieces.pop_back();
  auto currNode = getStartNodeFor(path);
  auto dir = walkPath(currNode, pieces);
  if (!dir) {
    return Status::NotFound;
  }
  if (!dir->isDirectory) {
    return Status::NotADirectory;
  }
  parent = dir;
  name = std::move(newName);
  return Status::Ok;
}

std::size_t FileSystem::getDepthOf(const Node *node) {
  size_t depth = 0;
  while (node->parent) {
    depth++;
    node = node->parent;
  }
  return depth;
}

std::size_t FileSystem::getHeightOf(const Node *node) {
  if (!node || !node->isDirectory || node->children.empty()) {
    return 0;
  }
  size_t maxHeight = 0;
  for (const auto &[childName, child] : node->children) {
    size_t childHeight = getHeightOf(child.get());
    maxHeight = std::max(maxHeight, childHeight);
  }
  return 1 + maxHeight;
}

Status FileSystem::createNode(const std::string &path, bool isDirectory,
                              Node *&created) {
  Node *parent = nullptr;
  std::string name;
  // use resolveParent to set parent and name
  Status status = resolveParent(path, parent, name);
  if (status != Status::Ok) {
    return status;
  }
  if (getDepthOf(parent) >= Config::MAX_DIRECTORY_DEPTH) {
    return Status::MaxDepthReached;
  }
  auto &children = parent->children;
  auto node = std::make_unique<Node>(isDirectory, name);
  // try_emplace returns false if key exists in children alr
  // can use that to return AlreadyExists instead of .count on map
  auto [it, success] = children.try_emplace(name, std::move(node));
  if (!success) {
    return Status::AlreadyExists;
  }
  it->second->parent = parent;
  created = it->second.get();
  return Status::Ok;
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

Node *FileSystem::walkPath(Node *currNode,
                           const std::vector<std::string> &pieces) const {
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

Node *FileSystem::getStartNodeFor(const std::string &path) const {
  return (!path.empty() && path[0] == '/') ? root_.get() : currDirectory_;
}

bool FileSystem::isAncestor(const Node *ancestor, const Node *node) {
  while (node) {
    if (node == ancestor) {
      return true;
    }
    node = node->parent;
  }
  return false;
}

// Public Methods
std::string FileSystem::pwd() const { return getPath(currDirectory_); }

Status FileSystem::cat(const std::string &path, std::string &out) const {
  if (path.empty()) {
    return Status::InvalidArguments;
  }
  Node *node = resolve(path);
  if (!node) {
    return Status::NotFound;
  }
  if (node->isDirectory) {
    return Status::NotAFile;
  }
  // no std::move here, just a copy of the content
  out = node->content;
  return Status::Ok;
}

Status FileSystem::ls(std::vector<std::string> &out) const {
  return ls(".", out);
}

Status FileSystem::ls(const std::string &path,
                      std::vector<std::string> &out) const {
  if (path.empty()) {
    return Status::InvalidArguments;
  }
  Node *node = resolve(path);
  if (!node) {
    return Status::NotFound;
  }
  std::vector<std::string> res;
  if (node->isDirectory) {
    for (auto &[name, child] : node->children) {
      if (child->isDirectory) {
        res.push_back(name + '/');
      } else {
        res.push_back(name);
      }
    }
  } else {
    res.push_back(node->name);
  }
  out = std::move(res);
  return Status::Ok;
}

Status FileSystem::mkdir(const std::string &path) {
  Node *node = nullptr;
  return createNode(path, true, node);
}

Status FileSystem::cd(const std::string &path) {
  if (path.empty()) {
    return Status::InvalidArguments;
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

Status FileSystem::touch(const std::string &path) {
  Node *node = nullptr;
  Status status = createNode(path, false, node);
  if (status == Status::AlreadyExists) {
    return Status::Ok;
  }
  return status;
}

Status FileSystem::write(const std::string &path, std::string content,
                         bool isAppend) {
  if (path.empty()) {
    return Status::InvalidArguments;
  }
  if (content.size() > Config::MAX_FILE_SIZE_BYTES) {
    return Status::MaxFileSizeReached;
  }
  Node *node = resolve(path);
  if (!node) {
    Status status = createNode(path, false, node);
    if (status != Status::Ok) {
      return status;
    }
  }
  if (node->isDirectory) {
    return Status::NotAFile;
  }
  if (isAppend) {
    if (node->content.size() + content.size() > Config::MAX_FILE_SIZE_BYTES) {
      return Status::MaxFileSizeReached;
    } else {
      node->content += content;
    }
  } else {
    node->content = std::move(content);
  }
  return Status::Ok;
}

Status FileSystem::rm(const std::string &path, bool recursive) {
  if (path.empty()) {
    return Status::InvalidArguments;
  }
  Node *node = resolve(path);
  if (!node) {
    return Status::NotFound;
  }
  if (node == root_.get()) {
    return Status::PermissionDenied;
  }
  if (isAncestor(node, currDirectory_)) {
    return Status::PermissionDenied;
  }
  if (node->isDirectory && !recursive) {
    return Status::NotAFile;
  }
  auto it = (node->parent->children).find(node->name);
  node->parent->children.erase(it);
  return Status::Ok;
}

Status FileSystem::mv(const std::string &source,
                      const std::string &destination) {
  // first do all the preliminary checks
  if (source.empty() || destination.empty()) {
    return Status::InvalidArguments;
  }
  Node *src = resolve(source);
  Node *dest = resolve(destination);
  if (src == root_.get()) {
    return Status::PermissionDenied;
  }
  if (!src) {
    return Status::NotFound;
  }

  // next lets set our target parent and target name
  Node *targetParent = nullptr;
  std::string targetName;
  if (dest && dest->isDirectory) {
    targetParent = dest;
    targetName = src->name;
  } else {
    Status status = resolveParent(destination, targetParent, targetName);
    if (status != Status::Ok) {
      return status;
    }
  }

  // checks before we start extracting/moving files
  if (isAncestor(src, targetParent)) {
    return Status::PermissionDenied;
  }
  bool overwriteAllowed = false;
  auto it = targetParent->children.find(targetName);
  if (it != targetParent->children.end()) {
    if (it->second.get() == src) {
      return Status::Ok;
    }
    if (!src->isDirectory && !it->second->isDirectory) {
      overwriteAllowed = true;
    } else {
      return Status::AlreadyExists;
    }
  }
  if (getHeightOf(src) + 1 + getDepthOf(targetParent) >
      Config::MAX_DIRECTORY_DEPTH) {
    return Status::MaxDepthReached;
  }

  // now we can start moving the files
  if (overwriteAllowed) {
    targetParent->children.erase(it);
  }
  auto node = src->parent->children.extract(src->name);
  node.key() = targetName;
  node.mapped()->name = targetName;
  node.mapped()->parent = targetParent;
  targetParent->children.insert(std::move(node));
  return Status::Ok;
}
