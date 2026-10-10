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

  // slice 1
  check(fs.pwd() == "/", "pwd at root is /");

  // slice 2: mkdir + ls
  check(fs.ls().empty(), "ls on a fresh filesystem is empty");

  check(fs.mkdir("b") == Status::Ok, "mkdir b");
  check(fs.mkdir("a") == Status::Ok, "mkdir a");
  check(fs.ls() == std::vector<std::string>{"a/", "b/"},
        "ls shows a/ b/ in alphabetical order");

  check(fs.mkdir("a") == Status::AlreadyExists,
        "mkdir a again -> AlreadyExists");
  check(fs.mkdir("") == Status::InvalidName, "mkdir \"\" -> InvalidName");
  check(fs.mkdir("x/y") == Status::InvalidName, "mkdir x/y -> InvalidName");
  check(fs.mkdir(".") == Status::InvalidName, "mkdir . -> InvalidName");
  check(fs.mkdir("..") == Status::InvalidName, "mkdir .. -> InvalidName");
  check(fs.ls().size() == 2, "failed mkdirs didn't add anything");

  // slice 3: cd
  check(fs.cd("a") == Status::Ok, "cd a");
  check(fs.pwd() == "/a", "pwd after cd a is /a");
  check(fs.ls().empty(), "ls inside a is empty");

  check(fs.mkdir("c") == Status::Ok, "mkdir c inside a");
  check(fs.ls() == std::vector<std::string>{"c/"}, "ls inside a shows c/");
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

  check(fs.ls() == std::vector<std::string>{"a/", "b/"},
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

  std::cout << "\nls:\n";
  for (const auto &entry : fs.ls()) {
    std::cout << "  " << entry << '\n';
  }

  std::cout << '\n'
            << (failures == 0 ? "all checks passed"
                              : std::to_string(failures) + " check(s) failed")
            << '\n';
  return failures == 0 ? 0 : 1;
}
