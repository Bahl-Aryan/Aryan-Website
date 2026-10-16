// this file AI generated because I didn't want to write this stuff lmao
#include <iostream>
#include <string>

#include "config.h"
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
  cdFrom("/a", "", Status::InvalidArguments, "/a");
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
  check(listAt("", Status::InvalidArguments, {}),
        "ls \"\" -> InvalidArguments");
  {
    std::vector<std::string> out = {"old"};
    fs.ls("nope", out);
    check(out == std::vector<std::string>{"old"},
          "failed ls leaves out untouched");
    fs.ls("/b", out);
    check(out == std::vector<std::string>{"x/"},
          "ls replaces out instead of appending");
  }

  // slice 5: touch, cat, write (tree: /a/{c/deep, y, z}, /b/x, cwd /)
  // catIs: cat(path) must return `expected` status and exactly `content`
  auto catIs = [&fs](const std::string &path, Status expected,
                     const std::string &content) {
    std::string out;
    return fs.cat(path, out) == expected && out == content;
  };

  // touch
  check(fs.touch("notes.txt") == Status::Ok, "touch notes.txt");
  check(listAt("/", Status::Ok, {"a/", "b/", "notes.txt"}),
        "ls / shows notes.txt with no trailing /");
  check(catIs("notes.txt", Status::Ok, ""), "a touched file is empty");
  check(fs.touch("notes.txt") == Status::Ok,
        "touch an existing file -> Ok (like Unix)");
  check(fs.touch("/a/c/f.txt") == Status::Ok, "touch /a/c/f.txt (absolute)");
  check(listAt("a/c", Status::Ok, {"deep/", "f.txt"}),
        "ls a/c shows the folder and the file, sorted");
  check(fs.touch("a") == Status::Ok, "touch an existing folder -> Ok");
  check(listAt("/", Status::Ok, {"a/", "b/", "notes.txt"}),
        "touch on a folder didn't turn it into a file");
  check(fs.touch("nope/x") == Status::NotFound, "touch nope/x -> NotFound");
  check(fs.touch("") != Status::Ok, "touch \"\" fails");
  check(fs.mkdir("notes.txt") == Status::AlreadyExists,
        "mkdir over an existing file -> AlreadyExists");

  // cat
  check(catIs("a", Status::NotAFile, ""), "cat a folder -> NotAFile");
  check(catIs("nope", Status::NotFound, ""), "cat nope -> NotFound");
  check(catIs("", Status::InvalidArguments, ""), "cat \"\" -> InvalidArguments");

  // write: create, replace, append
  check(fs.write("new.txt", "hello", false) == Status::Ok,
        "write to a new file creates it");
  check(catIs("new.txt", Status::Ok, "hello"), "cat new.txt -> hello");
  check(catIs("new.txt", Status::Ok, "hello"),
        "cat twice gives the same content (cat doesn't empty the file)");
  check(fs.write("new.txt", " world", true) == Status::Ok, "append ' world'");
  check(catIs("new.txt", Status::Ok, "hello world"), "append adds to the end");
  check(fs.write("new.txt", "bye", false) == Status::Ok, "write (replace) bye");
  check(catIs("new.txt", Status::Ok, "bye"), "replace overwrites the content");
  check(fs.write("/b/log.txt", "x", true) == Status::Ok,
        "append to a missing file creates it");
  check(catIs("/b/log.txt", Status::Ok, "x"), "cat /b/log.txt -> x");
  fs.cd("/a/c");
  check(fs.write("../../b/log.txt", " y", true) == Status::Ok,
        "from /a/c: append via ../../b/log.txt");
  check(catIs("/b/log.txt", Status::Ok, "x y"), "relative append landed in /b");
  fs.cd("/");

  // write failures
  check(fs.write("a", "hi", false) == Status::NotAFile,
        "write to a folder -> NotAFile");
  check(listAt("a", Status::Ok, {"c/", "y/", "z/"}),
        "failed write didn't change the folder");
  check(fs.write("nope/f", "x", false) == Status::NotFound,
        "write nope/f -> NotFound");
  check(fs.write("notes.txt/f", "x", false) == Status::NotADirectory,
        "write notes.txt/f -> NotADirectory (parent is a file)");
  check(fs.write("", "x", false) == Status::InvalidArguments,
        "write \"\" -> InvalidArguments");
  check(listAt("/", Status::Ok, {"a/", "b/", "new.txt", "notes.txt"}),
        "failed writes didn't create anything at root");

  // files inside other commands (waiting since slice 3)
  check(fs.cd("notes.txt") == Status::NotADirectory && fs.pwd() == "/",
        "cd into a file -> NotADirectory, doesn't move you");
  check(fs.cd("notes.txt/x") != Status::Ok && fs.pwd() == "/",
        "cd through a file fails, doesn't move you");
  check(listAt("notes.txt", Status::Ok, {"notes.txt"}),
        "ls on a file -> just its name");
  check(listAt("notes.txt/..", Status::NotFound, {}),
        "ls notes.txt/.. -> NotFound (can't go through a file)");
  check(fs.mkdir("notes.txt/x") == Status::NotADirectory,
        "mkdir notes.txt/x -> NotADirectory");
  check(fs.touch("/a/c/f.txt/x") == Status::NotADirectory,
        "touch /a/c/f.txt/x -> NotADirectory");

  // ---------------------------------------------------------------------
  // slice 6: each section below uses its own fresh FileSystem so the
  // trees stay small and easy to reason about.
  // lsIn / catIn: same as listAt / catIs, but for any FileSystem
  auto lsIn = [](FileSystem &f, const std::string &path, Status expected,
                 const std::vector<std::string> &names) {
    std::vector<std::string> out;
    return f.ls(path, out) == expected && out == names;
  };
  auto catIn = [](FileSystem &f, const std::string &path, Status expected,
                  const std::string &content) {
    std::string out;
    return f.cat(path, out) == expected && out == content;
  };

  // slice 6: rm
  {
    FileSystem r;
    r.mkdir("/p");
    r.mkdir("/p/q");
    r.touch("/p/q/f.txt");
    r.write("/p/w.txt", "hi", false);
    r.touch("/top.txt");

    check(r.rm("top.txt", false) == Status::Ok, "rm a file");
    check(lsIn(r, "/", Status::Ok, {"p/"}), "rm'd file is gone from ls");
    check(catIn(r, "/top.txt", Status::NotFound, ""), "cat a rm'd file -> NotFound");
    check(r.rm("nope", false) == Status::NotFound, "rm nope -> NotFound");
    check(r.rm("", false) == Status::InvalidArguments, "rm \"\" -> InvalidArguments");
    check(r.rm("/", true) == Status::PermissionDenied, "rm -r / -> PermissionDenied");
    check(r.rm("//..", true) == Status::PermissionDenied,
          "rm -r //.. (root in disguise) -> PermissionDenied");
    check(r.rm("p", false) == Status::NotAFile, "rm a folder without -r -> NotAFile");
    check(r.rm("p/q", false) == Status::NotAFile,
          "rm a non-empty folder without -r -> NotAFile");
    check(lsIn(r, "/p", Status::Ok, {"q/", "w.txt"}), "failed rm's changed nothing");

    // the folder you're in, or anything above it, must not be deleted
    r.cd("/p/q");
    check(r.rm(".", true) == Status::PermissionDenied, "rm -r . -> PermissionDenied");
    check(r.rm("..", true) == Status::PermissionDenied, "rm -r .. -> PermissionDenied");
    check(r.rm("/p", true) == Status::PermissionDenied,
          "rm -r /p while in /p/q -> PermissionDenied");
    check(r.pwd() == "/p/q", "pwd still works (currDirectory_ didn't dangle)");
    check(lsIn(r, ".", Status::Ok, {"f.txt"}), "ls . still works in /p/q");

    check(r.rm("f.txt", false) == Status::Ok, "rm a file relative to the current folder");
    check(lsIn(r, ".", Status::Ok, {}), "current folder is now empty");
    r.cd("/");
    check(r.rm("p", true) == Status::Ok, "rm -r p removes the whole subtree");
    check(lsIn(r, "/", Status::Ok, {}), "root is empty after rm -r p");
    check(catIn(r, "/p/w.txt", Status::NotFound, ""), "files inside are gone too");
    check(r.mkdir("p") == Status::Ok && lsIn(r, "p", Status::Ok, {}),
          "a re-created p starts empty");
    check(r.rm("p", true) == Status::Ok, "rm -r on an empty folder");

    // trailing slash means "must be a folder"
    r.touch("g.txt");
    check(r.rm("g.txt/", false) == Status::NotFound, "rm g.txt/ (a file) -> NotFound");
    check(lsIn(r, "/", Status::Ok, {"g.txt"}), "rm g.txt/ didn't delete it");
  }

  // slice 6: mv
  {
    FileSystem m;
    m.mkdir("/a");
    m.mkdir("/a/sub");
    m.mkdir("/b");
    m.mkdir("/c");
    m.write("/a/x.txt", "x", false);
    m.write("/a/y.txt", "y", false);
    m.write("/b/x.txt", "bx", false);

    // files: rename, move into a folder, move + rename
    check(m.mv("/a/y.txt", "/a/z.txt") == Status::Ok, "mv rename a file");
    check(lsIn(m, "/a", Status::Ok, {"sub/", "x.txt", "z.txt"}),
          "renamed file shows under its new name only");
    check(catIn(m, "/a/z.txt", Status::Ok, "y"), "renamed file keeps its content");
    check(m.mv("/a/z.txt", "/c") == Status::Ok, "mv a file into a folder");
    check(lsIn(m, "/c", Status::Ok, {"z.txt"}) && lsIn(m, "/a", Status::Ok, {"sub/", "x.txt"}),
          "file left /a and arrived in /c");
    check(m.mv("/c/z.txt", "/b/renamed.txt") == Status::Ok,
          "mv to another folder under a new name");
    check(catIn(m, "/b/renamed.txt", Status::Ok, "y"), "moved+renamed file has its content");

    // name collisions: file onto file overwrites (like Unix), both ways
    check(m.mv("/a/x.txt", "/b") == Status::Ok,
          "mv a file into a folder that has a file of the same name -> Ok");
    check(catIn(m, "/b/x.txt", Status::Ok, "x"), "the file in /b was replaced");
    check(catIn(m, "/a/x.txt", Status::NotFound, ""), "source is gone after overwrite");
    m.write("/a/x2.txt", "x2", false);
    check(m.mv("/a/x2.txt", "/b/x.txt") == Status::Ok, "mv file onto file by name overwrites");
    check(catIn(m, "/b/x.txt", Status::Ok, "x2"), "overwritten file has the new content");
    check(lsIn(m, "/a", Status::Ok, {"sub/"}), "/a has only sub/ left");

    m.write("/c/s.txt", "s", false);
    check(m.mv("/c/s.txt", "/c/s.txt") == Status::Ok, "mv a file onto itself -> Ok (no-op)");
    check(m.mv("/c/s.txt", "/c") == Status::Ok, "mv a file into its own folder -> Ok");
    check(m.mv("/c/s.txt", "/c/./s.txt") == Status::Ok, "mv s.txt ./s.txt -> Ok");
    check(catIn(m, "/c/s.txt", Status::Ok, "s"), "self-moves didn't free or change the file");

    m.mkdir("/b/s.txt"); // a FOLDER named s.txt
    check(m.mv("/c/s.txt", "/b") == Status::AlreadyExists,
          "file onto a folder of the same name -> AlreadyExists");
    m.mkdir("/c/f");
    m.touch("/b/f");
    check(m.mv("/c/f", "/b") == Status::AlreadyExists,
          "folder onto a file of the same name -> AlreadyExists");
    check(lsIn(m, "/b/s.txt", Status::Ok, {}) && catIn(m, "/c/s.txt", Status::Ok, "s"),
          "collisions changed nothing");

    // folders move with everything inside them
    m.write("/a/sub/deep.txt", "d", false);
    check(m.mv("/a", "/c") == Status::Ok, "mv a folder into another folder");
    check(lsIn(m, "/", Status::Ok, {"b/", "c/"}), "a left the root");
    check(catIn(m, "/c/a/sub/deep.txt", Status::Ok, "d"), "whole subtree moved with it");
    check(m.mv("/c/a", "/arch") == Status::Ok, "mv rename a folder");
    check(lsIn(m, "/arch", Status::Ok, {"sub/"}), "renamed folder keeps its children");

    // refused moves
    check(m.mv("/arch", "/arch") == Status::PermissionDenied, "mv a a -> PermissionDenied");
    check(m.mv("/arch", "/arch/sub") == Status::PermissionDenied,
          "mv a into its own subfolder -> PermissionDenied");
    check(lsIn(m, "/arch/sub", Status::Ok, {"deep.txt"}), "refused moves changed nothing");
    check(m.mv("/", "/b") == Status::PermissionDenied, "mv / -> PermissionDenied");
    check(m.mv("nope", "/b") == Status::NotFound, "mv nope -> NotFound");
    check(m.mv("", "/b") == Status::InvalidArguments, "mv \"\" x -> InvalidArguments");
    check(m.mv("/b/x.txt", "") == Status::InvalidArguments, "mv x \"\" -> InvalidArguments");
    check(m.mv("/b/x.txt", "/nope/x.txt") == Status::NotFound,
          "mv to a missing folder -> NotFound");

    // moving the folder you're standing in is safe: the node keeps its address
    m.cd("/arch/sub");
    check(m.mv("/arch", "/b") == Status::Ok, "mv the folder above you");
    check(m.pwd() == "/b/arch/sub", "pwd follows the move: /b/arch/sub");
    check(m.cd("..") == Status::Ok && m.pwd() == "/b/arch", "cd .. goes to the new parent");
    m.cd("/");

    // trailing slash on the destination means "must be an existing folder"
    m.touch("/t.txt");
    check(m.mv("/t.txt", "/newdir/") == Status::NotADirectory,
          "mv t.txt newdir/ (doesn't exist) -> NotADirectory");
    check(catIn(m, "/t.txt", Status::Ok, ""), "t.txt was not renamed to newdir");
    check(m.mv("/t.txt", "/b/") == Status::Ok && catIn(m, "/b/t.txt", Status::Ok, ""),
          "mv t.txt b/ (existing folder) moves it in");
  }

  // slice 6: guards (limits in config.h)
  {
    FileSystem g;
    const std::size_t maxName = Config::MAX_FILENAME_LENGTH;
    const std::size_t maxDepth = Config::MAX_DIRECTORY_DEPTH;
    const std::size_t maxSize = Config::MAX_FILE_SIZE_BYTES;

    // name length
    check(g.mkdir(std::string(maxName, 'n')) == Status::Ok, "name at the length limit -> Ok");
    check(g.mkdir(std::string(maxName + 1, 'n')) == Status::InvalidName,
          "name one over the limit -> InvalidName");
    check(g.touch(std::string(maxName + 1, 't')) == Status::InvalidName,
          "touch with a too-long name -> InvalidName");

    // depth: /d/d/d/... exactly maxDepth levels is allowed, one more is not
    std::string deep;
    bool allOk = true;
    for (std::size_t i = 0; i < maxDepth; i++) {
      deep += "/d";
      allOk = allOk && g.mkdir(deep) == Status::Ok;
    }
    check(allOk, "mkdir down to exactly the depth limit");
    check(g.mkdir(deep + "/d") == Status::MaxDepthReached, "mkdir one past the limit -> MaxDepthReached");
    check(g.touch(deep + "/f") == Status::MaxDepthReached, "touch one past the limit -> MaxDepthReached");
    check(g.write(deep + "/f", "x", false) == Status::MaxDepthReached,
          "write one past the limit -> MaxDepthReached");

    // mv must count the whole subtree, not just the folder being moved
    g.mkdir("/e");
    g.mkdir("/e/e"); // /e has height 1
    check(g.mv("/e", deep) == Status::MaxDepthReached,
          "mv a 2-level folder into the deepest folder -> MaxDepthReached");
    std::string twoAbove = deep.substr(0, deep.size() - 4); // depth maxDepth - 2
    check(g.mv("/e", twoAbove) == Status::Ok, "the same folder fits 2 levels higher");
    g.touch("/f.txt");
    check(g.mv("/f.txt", deep) == Status::MaxDepthReached,
          "mv a file into the deepest folder -> MaxDepthReached");

    // file size
    check(g.write("big.txt", std::string(maxSize, 'x'), false) == Status::Ok,
          "write exactly the size limit -> Ok");
    check(g.write("big.txt", std::string(maxSize + 1, 'x'), false) == Status::MaxFileSizeReached,
          "write one byte over -> MaxFileSizeReached");
    check(catIn(g, "big.txt", Status::Ok, std::string(maxSize, 'x')),
          "rejected write left the file unchanged");
    check(g.write("big.txt", "y", true) == Status::MaxFileSizeReached,
          "append one byte to a full file -> MaxFileSizeReached");
    g.write("big.txt", "a", false);
    check(g.write("big.txt", std::string(maxSize - 1, 'b'), true) == Status::Ok,
          "append up to exactly the limit -> Ok");
    check(g.write("big.txt", "c", true) == Status::MaxFileSizeReached,
          "append one more byte -> MaxFileSizeReached");
  }

  // slice 6: trailing slash on the other commands
  {
    FileSystem t;
    t.mkdir("/dir");
    t.write("/file.txt", "f", false);
    check(t.touch("new/") == Status::NotADirectory, "touch new/ -> NotADirectory");
    check(t.write("new2/", "x", false) == Status::NotADirectory, "write new2/ -> NotADirectory");
    check(lsIn(t, "/", Status::Ok, {"dir/", "file.txt"}), "neither created a file");
    check(t.mkdir("made/") == Status::Ok && lsIn(t, "made", Status::Ok, {}),
          "mkdir made/ still works");
    check(catIn(t, "file.txt/", Status::NotFound, ""), "cat file.txt/ -> NotFound");
    check(lsIn(t, "file.txt/", Status::NotFound, {}), "ls file.txt/ -> NotFound");
    check(t.cd("file.txt/") != Status::Ok && t.pwd() == "/", "cd file.txt/ fails");
    check(t.cd("dir/") == Status::Ok && t.pwd() == "/dir", "cd dir/ works");
    check(lsIn(t, "/", Status::Ok, {"dir/", "file.txt", "made/"}), "ls / with a trailing slash");
  }

  // slice 6: the iterative destructor
  // A chain far deeper than the depth limit, built by hand (bypasses mkdir).
  // A recursive destructor overflows the stack on this; yours should not.
  {
    const int levels = 200000;
    auto root = std::make_unique<Node>(true, "");
    Node *curr = root.get();
    for (int i = 0; i < levels; i++) {
      auto child = std::make_unique<Node>(true, "d");
      child->parent = curr;
      Node *next = child.get();
      curr->children.emplace("d", std::move(child));
      curr = next;
    }
    root.reset(); // frees all 200,000 levels
    check(true, "destroyed a 200,000-level chain without a stack overflow");
  }

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
