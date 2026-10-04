#pragma once
#include <map>
#include <memory>
#include <string>

struct Node {
  bool isDirectory;
  std::string name;
  std::string content; // used if isDirectory == false

  Node *parent = nullptr; // folder that contains this node
  std::map<std::string, std::unique_ptr<Node>> children;

  // Node constructor
  Node(bool isDir, const std::string &n) : isDirectory(isDir), name(n) {}
};

enum class Status {
  Ok,                // success
  NotFound,          // path doesn't exist
  NotADirectory,     // tried to run a dir command on a file
  NotAFile,          // tried to run a file command on a dir
  AlreadyExists,     // create a dir or file that already exists
  DirectoryNotEmpty, // rm on a non-empty dir without -r
  InvalidName,       // empty or name containing `/`
};

class FileSystem {
public:
  FileSystem();

  std::string pwd() const;

private:
  std::unique_ptr<Node> root_; // single root that owns the whole tree
  Node *currDirectory_ = nullptr;

  // given path, resolve to the Node
  Node *resolve(const std::string &path) const;

  // used for paths that don't exist yet
  Status resolveParent(const std::string &path, Node *&parent,
                       std::string &name) const;

  static std::string getPath(const Node *node);
  static bool isValidName(const std::string &name);
};
