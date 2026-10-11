// this file AI generated because I didn't want to write this stuff lmao
#include <iostream>
#include <string>

#include "fs.h"

// Prints PASS/FAIL for one check and counts failures
static int failures = 0;
static void check(bool ok, const std::string &what) {
  std::cout << (ok ? "PASS  " : "FAIL  ") << what << '\n';
  if (!ok) {
    failures++;
  }
}

int main() {
  FileSystem fs;

  // list(): plain ls of the current folder, as a vector (empty if ls fails)
  auto list = [&fs]() {
    std::vector<std::string> out;
    fs.ls(out);
    return out;
  };

  // slice 1
  check(fs.pwd() == "/", "pwd at root is /");

  // slice 2: mkdir + ls
  check(list().empty(), "ls on a fresh filesystem is empty");

  check(fs.mkdir("b") == Status::Ok, "mkdir b");
  check(fs.mkdir("a") == Status::Ok, "mkdir a");
  check(list() == std::vector<std::string>{"a/", "b/"},
        "ls shows a/ b/ in alphabetical order");

  check(fs.mkdir("a") == Status::AlreadyExists,
        "mkdir a again -> AlreadyExists");
  check(fs.mkdir("") == Status::InvalidName, "mkdir \"\" -> InvalidName");
  check(fs.mkdir("x/y") == Status::NotFound, "mkdir x/y -> NotFound (no folder x)");
  check(fs.mkdir(".") == Status::InvalidName, "mkdir . -> InvalidName");
  check(fs.mkdir("..") == Status::InvalidName, "mkdir .. -> InvalidName");
  check(list().size() == 2, "failed mkdirs didn't add anything");

  // slice 3: cd
  check(fs.cd("a") == Status::Ok, "cd a");
  check(fs.pwd() == "/a", "pwd after cd a is /a");
  check(list().empty(), "ls inside a is empty");

  check(fs.mkdir("c") == Status::Ok, "mkdir c inside a");
  check(list() == std::vector<std::string>{"c/"}, "ls inside a shows c/");
  check(fs.cd("c") == Status::Ok, "cd c");
  check(fs.pwd() == "/a/c", "pwd after cd c is /a/c (nested)");

  check(fs.cd(".") == Status::Ok, "cd . is Ok");
  check(fs.pwd() == "/a/c", "cd . stays in /a/c");

  check(fs.cd("..") == Status::Ok, "cd .. from /a/c");
  check(fs.pwd() == "/a", "pwd after cd .. is /a");
  check(fs.cd("..") == Status::Ok, "cd .. from /a");
  check(fs.pwd() == "/", "pwd after second cd .. is /");
  check(fs.cd("..") == Status::Ok, "cd .. at root is Ok");
  check(fs.pwd() == "/", "cd .. at root stays at /");

  check(list() == std::vector<std::string>{"a/", "b/"},
        "root still shows only a/ b/ (c went inside a)");

  check(fs.cd("nope") == Status::NotFound, "cd nope -> NotFound");
  check(fs.pwd() == "/", "failed cd doesn't move you");
  check(fs.cd("") != Status::Ok, "cd \"\" fails");
  check(fs.pwd() == "/", "cd \"\" doesn't move you");

  check(fs.cd("b") == Status::Ok && fs.pwd() == "/b", "cd b works from root");
  check(fs.cd("a") == Status::NotFound, "cd a from /b -> NotFound (a is a sibling)");
  fs.cd("..");
  // cd into a file -> NotADirectory: needs touch, checked in slice 5

  // slice 4: cd with real paths (tree is now /a, /a/c, /b)
  // cdFrom: stand in `from`, run cd(path), expect that status and that pwd
  auto cdFrom = [&fs](const std::string &from, const std::string &path,
                      Status expected, const std::string &expectedPwd) {
    fs.cd(from);
    bool ok = fs.cd(path) == expected && fs.pwd() == expectedPwd;
    check(ok, "from " + from + ": cd \"" + path + "\" -> " + expectedPwd);
  };
  cdFrom("/", "a/c", Status::Ok, "/a/c");
  cdFrom("/", "/a/c", Status::Ok, "/a/c");
  cdFrom("/a/c", "..", Status::Ok, "/a");
  cdFrom("/a/c", "/b", Status::Ok, "/b");
  cdFrom("/a", "../b", Status::Ok, "/b");
  cdFrom("/a/c", "../../..", Status::Ok, "/");
  cdFrom("/", "/..", Status::Ok, "/");
  cdFrom("/", "/../a", Status::Ok, "/a");
  cdFrom("/b", "/a/../a/c", Status::Ok, "/a/c");
  cdFrom("/a", "c/..", Status::Ok, "/a");
  cdFrom("/", "./a/./c/..", Status::Ok, "/a");
  cdFrom("/", "//a//c//", Status::Ok, "/a/c");
  cdFrom("/a/c", "/", Status::Ok, "/");
  cdFrom("/a", "nope", Status::NotFound, "/a");
  cdFrom("/a", "c/nope", Status::NotFound, "/a");
  cdFrom("/a", "a/c", Status::NotFound, "/a"); // relative: means /a/a/c
  cdFrom("/a", "/nope/c", Status::NotFound, "/a");
  cdFrom("/a", "", Status::InvalidName, "/a");
  fs.cd("/");

  // slice 4: mkdir with paths
  // listAt: ls(path) must return `expected` status and exactly `names`
  auto listAt = [&fs](const std::string &path, Status expected,
                      const std::vector<std::string> &names) {
    std::vector<std::string> out;
    return fs.ls(path, out) == expected && out == names;
  };
  fs.cd("/a/c");
  check(fs.mkdir("deep") == Status::Ok, "from /a/c: mkdir deep");
  check(fs.mkdir("/a/c/deep") == Status::AlreadyExists,
        "mkdir /a/c/deep again -> AlreadyExists");
  check(fs.mkdir("/b/x") == Status::Ok, "from /a/c: mkdir /b/x (absolute)");
  check(fs.mkdir("../y") == Status::Ok, "from /a/c: mkdir ../y (makes /a/y)");
  fs.cd("/");
  check(fs.mkdir("a//z/") == Status::Ok, "from /: mkdir a//z/ (makes /a/z)");
  check(fs.cd("/a/c/deep") == Status::Ok && fs.pwd() == "/a/c/deep",
        "cd into the new folder, pwd is /a/c/deep (parent pointer is right)");
  check(fs.cd("/b/x") == Status::Ok && fs.pwd() == "/b/x",
        "cd /b/x, pwd is /b/x");
  fs.cd("/");

  check(fs.mkdir("nope/x") == Status::NotFound, "mkdir nope/x -> NotFound");
  check(fs.mkdir("/") == Status::InvalidName, "mkdir / -> InvalidName");
  check(fs.mkdir("a/..") == Status::InvalidName, "mkdir a/.. -> InvalidName");
  check(fs.mkdir("a/.") == Status::InvalidName, "mkdir a/. -> InvalidName");
  check(list() == std::vector<std::string>{"a/", "b/"},
        "failed mkdirs didn't add anything at root");

  // slice 4: ls with paths (tree: /a/{c/deep, y, z}, /b/x)
  check(listAt(".", Status::Ok, {"a/", "b/"}), "ls . at root");
  check(listAt("/", Status::Ok, {"a/", "b/"}), "ls /");
  check(listAt("/a", Status::Ok, {"c/", "y/", "z/"}),
        "ls /a shows c/ y/ z/ in order");
  check(listAt("a/c", Status::Ok, {"deep/"}), "ls a/c (relative)");
  check(listAt("/a/c/deep", Status::Ok, {}), "ls an empty folder -> Ok, []");
  fs.cd("/a/c");
  check(listAt("..", Status::Ok, {"c/", "y/", "z/"}), "from /a/c: ls ..");
  check(listAt("../../b", Status::Ok, {"x/"}), "from /a/c: ls ../../b");
  check(list() == std::vector<std::string>{"deep/"},
        "plain ls lists the current folder");
  fs.cd("/");
  check(listAt("nope", Status::NotFound, {}), "ls nope -> NotFound");
  check(listAt("", Status::NotFound, {}), "ls \"\" -> NotFound");
  {
    std::vector<std::string> out = {"old"};
    fs.ls("nope", out);
    check(out == std::vector<std::string>{"old"},
          "failed ls leaves out untouched");
    fs.ls("/b", out);
    check(out == std::vector<std::string>{"x/"},
          "ls replaces out instead of appending");
  }
  // ls on a file -> just its name: needs touch, checked in slice 5

  std::cout << "\nls:\n";
  for (const auto &entry : list()) {
    std::cout << "  " << entry << '\n';
  }

  std::cout << '\n'
            << (failures == 0 ? "all checks passed"
                              : std::to_string(failures) + " check(s) failed")
            << '\n';
  return failures == 0 ? 0 : 1;
}
