#pragma once
#include <map>
#include <memory>
#include <string>
#include <vector>

struct Node {
  bool isDirectory;
  std::string name;
  std::string content; // used if isDirectory == false

  Node *parent = nullptr; // folder that contains this node
  std::map<std::string, std::unique_ptr<Node>> children;

  // Node constructor
  Node(bool isDir, const std::string &n) : isDirectory(isDir), name(n) {}
  // Node destructor
  ~Node();
};

enum class Status {
  Ok,                 // success
  NotFound,           // path doesn't exist
  NotADirectory,      // tried to run a dir command on a file
  NotAFile,           // tried to run a file command on a dir
  AlreadyExists,      // create a dir or file that already exists
  InvalidName,        // empty or name containing `/`
  InvalidArguments,   // invalid arguments passed
  PermissionDenied,   // commands that are not allowed
  MaxDepthReached,    // max depth of children reached because I said so
  MaxFileSizeReached, // max content length
};

class FileSystem {
public:
  FileSystem();

  std::string pwd() const;
  Status cat(const std::string &path, std::string &out) const;
  Status ls(std::vector<std::string> &out) const;
  Status ls(const std::string &path, std::vector<std::string> &out) const;
  Status mkdir(const std::string &path);
  Status cd(const std::string &path);
  Status touch(const std::string &path);

  // write into file operator, > and >>
  Status write(const std::string &path, std::string content, bool isAppend);
  Status rm(const std::string &path, bool recursive);
  Status mv(const std::string &source, const std::string &destination);

private:
  std::unique_ptr<Node> root_; // single root that owns the whole tree
  Node *currDirectory_ = nullptr;

  // given path, resolve to the Node
  Node *resolve(const std::string &path) const;

  // used for paths that don't exist yet
  Status resolveParent(const std::string &path, Node *&parent,
                       std::string &name) const;
  Status createNode(const std::string &path, bool isDirectory, Node *&created);
  Node *getStartNodeFor(const std::string &path) const;
  Node *walkPath(Node *currNode, const std::vector<std::string> &pieces) const;
  static std::string getPath(const Node *node);
  static bool isValidName(const std::string &name);
  static std::vector<std::string> splitPath(const std::string &path);

  // is node B below node A
  static bool isAncestor(const Node *ancestor, const Node *node);
  static std::size_t getDepthOf(const Node *node);
  static std::size_t getHeightOf(const Node *node);
  static bool endsWithSlash(const std::string &path);
};
