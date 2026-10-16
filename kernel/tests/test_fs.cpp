// GoogleTest suite for the in-memory filesystem (src/fs.h).
// AI generated
#include <gtest/gtest.h>

#include <memory>
#include <ostream>
#include <string>
#include <vector>

#include "config.h"
#include "fs.h"

using Names = std::vector<std::string>;

// Lets GoogleTest print Status values by name in failure messages
// (otherwise an enum class prints as raw bytes).
void PrintTo(Status s, std::ostream *os) {
  switch (s) {
  case Status::Ok:
    *os << "Ok";
    return;
  case Status::NotFound:
    *os << "NotFound";
    return;
  case Status::NotADirectory:
    *os << "NotADirectory";
    return;
  case Status::NotAFile:
    *os << "NotAFile";
    return;
  case Status::AlreadyExists:
    *os << "AlreadyExists";
    return;
  case Status::InvalidName:
    *os << "InvalidName";
    return;
  case Status::InvalidArguments:
    *os << "InvalidArguments";
    return;
  case Status::PermissionDenied:
    *os << "PermissionDenied";
    return;
  case Status::MaxDepthReached:
    *os << "MaxDepthReached";
    return;
  case Status::MaxFileSizeReached:
    *os << "MaxFileSizeReached";
    return;
  }
  *os << "Status(" << static_cast<int>(s) << ")";
}

// Base fixture: a fresh FileSystem plus helpers for reading state back.
class FsTest : public ::testing::Test {
protected:
  FileSystem fs;

  // ls(path); fails the test if ls doesn't return Ok.
  Names List(const std::string &path = ".") {
    Names out;
    EXPECT_EQ(fs.ls(path, out), Status::Ok) << "ls " << path;
    return out;
  }

  // cat(path); fails the test if cat doesn't return Ok.
  std::string Cat(const std::string &path) {
    std::string out;
    EXPECT_EQ(fs.cat(path, out), Status::Ok) << "cat " << path;
    return out;
  }

  Status LsStatus(const std::string &path) {
    Names out;
    return fs.ls(path, out);
  }

  Status CatStatus(const std::string &path) {
    std::string out;
    return fs.cat(path, out);
  }
};

// ---------------------------------------------------------------------------
// A fresh filesystem

TEST_F(FsTest, StartsAtRootWithNothingInIt) {
  EXPECT_EQ(fs.pwd(), "/");
  EXPECT_EQ(List("."), Names{});
  EXPECT_EQ(List("/"), Names{});
}

TEST_F(FsTest, PlainLsListsTheCurrentFolder) {
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.mkdir("a/inner"), Status::Ok);
  ASSERT_EQ(fs.cd("a"), Status::Ok);

  Names out;
  EXPECT_EQ(fs.ls(out), Status::Ok);
  EXPECT_EQ(out, Names{"inner/"});
}

// ---------------------------------------------------------------------------
// mkdir

TEST_F(FsTest, MkdirCreatesAnEmptyFolder) {
  EXPECT_EQ(fs.mkdir("a"), Status::Ok);
  EXPECT_EQ(List("/"), Names{"a/"});
  EXPECT_EQ(List("/a"), Names{});
}

TEST_F(FsTest, LsIsAlphabeticalRegardlessOfCreationOrder) {
  ASSERT_EQ(fs.mkdir("b"), Status::Ok);
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.touch("c.txt"), Status::Ok);
  EXPECT_EQ(List("/"), (Names{"a/", "b/", "c.txt"}));
}

TEST_F(FsTest, MkdirDuplicateFailsAndKeepsTheOriginal) {
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.touch("a/keep.txt"), Status::Ok);

  EXPECT_EQ(fs.mkdir("a"), Status::AlreadyExists);
  EXPECT_EQ(List("/a"), Names{"keep.txt"});
}

TEST_F(FsTest, MkdirRejectsInvalidNamesAndCreatesNothing) {
  EXPECT_EQ(fs.mkdir(""), Status::InvalidName);
  EXPECT_EQ(fs.mkdir("/"), Status::InvalidName);
  EXPECT_EQ(fs.mkdir("."), Status::InvalidName);
  EXPECT_EQ(fs.mkdir(".."), Status::InvalidName);
  EXPECT_EQ(fs.mkdir("a/.."), Status::InvalidName);
  EXPECT_EQ(fs.mkdir("a/."), Status::InvalidName);
  EXPECT_EQ(List("/"), Names{});
}

TEST_F(FsTest, MkdirNeedsAnExistingParentFolder) {
  ASSERT_EQ(fs.touch("file.txt"), Status::Ok);

  EXPECT_EQ(fs.mkdir("nope/x"), Status::NotFound);
  EXPECT_EQ(fs.mkdir("file.txt/x"), Status::NotADirectory);
  EXPECT_EQ(List("/"), Names{"file.txt"});
}

TEST_F(FsTest, MkdirWorksWithRelativeAbsoluteAndMessyPaths) {
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.mkdir("a/c"), Status::Ok);
  ASSERT_EQ(fs.mkdir("b"), Status::Ok);
  ASSERT_EQ(fs.cd("/a/c"), Status::Ok);

  EXPECT_EQ(fs.mkdir("deep"), Status::Ok);   // relative
  EXPECT_EQ(fs.mkdir("/b/x"), Status::Ok);   // absolute
  EXPECT_EQ(fs.mkdir("../y"), Status::Ok);   // through ..
  EXPECT_EQ(fs.mkdir("/a//z/"), Status::Ok); // doubled + trailing slashes

  EXPECT_EQ(List("/a/c"), Names{"deep/"});
  EXPECT_EQ(List("/b"), Names{"x/"});
  EXPECT_EQ(List("/a"), (Names{"c/", "y/", "z/"}));
}

TEST_F(FsTest, NewFolderPointsAtTheResolvedParent) {
  // Created from somewhere else entirely: its parent must still be /a/b.
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.mkdir("a/b"), Status::Ok);
  ASSERT_EQ(fs.mkdir("other"), Status::Ok);
  ASSERT_EQ(fs.cd("/other"), Status::Ok);
  ASSERT_EQ(fs.mkdir("/a/b/new"), Status::Ok);

  ASSERT_EQ(fs.cd("/a/b/new"), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/a/b/new");
  ASSERT_EQ(fs.cd(".."), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/a/b");
}

// ---------------------------------------------------------------------------
// cd (table-driven): tree is /a, /a/c, /b, /b/f.txt

struct CdCase {
  std::string from;
  std::string path;
  Status expected;
  std::string pwdAfter;
};

void PrintTo(const CdCase &c, std::ostream *os) {
  *os << "from " << c.from << ": cd \"" << c.path << "\"";
}

class CdTest : public FsTest, public ::testing::WithParamInterface<CdCase> {
protected:
  void SetUp() override {
    ASSERT_EQ(fs.mkdir("/a"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/a/c"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/b"), Status::Ok);
    ASSERT_EQ(fs.touch("/b/f.txt"), Status::Ok);
  }
};

TEST_P(CdTest, LandsInTheRightPlace) {
  const CdCase &c = GetParam();
  ASSERT_EQ(fs.cd(c.from), Status::Ok);
  EXPECT_EQ(fs.cd(c.path), c.expected);
  EXPECT_EQ(fs.pwd(), c.pwdAfter);
}

INSTANTIATE_TEST_SUITE_P(
    Paths, CdTest,
    ::testing::Values(
        // single names
        CdCase{"/", "a", Status::Ok, "/a"},
        CdCase{"/a", "c", Status::Ok, "/a/c"},
        CdCase{"/a/c", ".", Status::Ok, "/a/c"},
        CdCase{"/a/c", "..", Status::Ok, "/a"},
        CdCase{"/", "..", Status::Ok, "/"},
        // relative and absolute paths
        CdCase{"/", "a/c", Status::Ok, "/a/c"},
        CdCase{"/b", "/a/c", Status::Ok, "/a/c"},
        CdCase{"/a/c", "/", Status::Ok, "/"},
        CdCase{"/a", "../b", Status::Ok, "/b"},
        // .. past the root stays at the root
        CdCase{"/a/c", "../../..", Status::Ok, "/"},
        CdCase{"/", "/..", Status::Ok, "/"},
        CdCase{"/", "/../a", Status::Ok, "/a"},
        CdCase{"/b", "/a/../a/c", Status::Ok, "/a/c"},
        CdCase{"/a", "c/..", Status::Ok, "/a"},
        // messy input
        CdCase{"/", "./a/./c/..", Status::Ok, "/a"},
        CdCase{"/", "//a//c//", Status::Ok, "/a/c"},
        CdCase{"/", "a/", Status::Ok, "/a"},
        // failures never move you
        CdCase{"/a", "nope", Status::NotFound, "/a"},
        CdCase{"/a", "c/nope", Status::NotFound, "/a"},
        CdCase{"/a", "a/c", Status::NotFound, "/a"}, // relative: /a/a/c
        CdCase{"/b", "a", Status::NotFound, "/b"},   // a is a sibling
        CdCase{"/a", "/nope/c", Status::NotFound, "/a"},
        CdCase{"/a", "", Status::InvalidArguments, "/a"},
        // files
        CdCase{"/b", "f.txt", Status::NotADirectory, "/b"},
        CdCase{"/b", "f.txt/x", Status::NotFound, "/b"},
        CdCase{"/b", "f.txt/", Status::NotFound, "/b"}));

// ---------------------------------------------------------------------------
// ls with paths: tree is /a/c/deep, /a/y, /b/x, /notes.txt

class LsTest : public FsTest {
protected:
  void SetUp() override {
    ASSERT_EQ(fs.mkdir("/a"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/a/c"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/a/c/deep"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/a/y"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/b"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/b/x"), Status::Ok);
    ASSERT_EQ(fs.touch("/notes.txt"), Status::Ok);
  }
};

TEST_F(LsTest, ListsAnyFolderByPath) {
  EXPECT_EQ(List("/"), (Names{"a/", "b/", "notes.txt"}));
  EXPECT_EQ(List("."), (Names{"a/", "b/", "notes.txt"}));
  EXPECT_EQ(List("/a"), (Names{"c/", "y/"}));
  EXPECT_EQ(List("a/c"), Names{"deep/"});
  EXPECT_EQ(List("/a/c/deep"), Names{});
}

TEST_F(LsTest, RelativePathsStartFromTheCurrentFolder) {
  ASSERT_EQ(fs.cd("/a/c"), Status::Ok);
  EXPECT_EQ(List(".."), (Names{"c/", "y/"}));
  EXPECT_EQ(List("../../b"), Names{"x/"});
  EXPECT_EQ(List("."), Names{"deep/"});
}

TEST_F(LsTest, LsOnAFileShowsJustItsName) {
  EXPECT_EQ(List("notes.txt"), Names{"notes.txt"});
}

TEST_F(LsTest, LsFailures) {
  EXPECT_EQ(LsStatus("nope"), Status::NotFound);
  EXPECT_EQ(LsStatus(""), Status::InvalidArguments);
  EXPECT_EQ(LsStatus("notes.txt/.."), Status::NotFound); // through a file
  EXPECT_EQ(LsStatus("notes.txt/"), Status::NotFound);   // trailing slash
}

TEST_F(LsTest, FailedLsLeavesOutputUntouched) {
  Names out = {"old"};
  EXPECT_EQ(fs.ls("nope", out), Status::NotFound);
  EXPECT_EQ(out, Names{"old"});
}

TEST_F(LsTest, LsReplacesOutputInsteadOfAppending) {
  Names out = {"old"};
  EXPECT_EQ(fs.ls("/b", out), Status::Ok);
  EXPECT_EQ(out, Names{"x/"});
}

// ---------------------------------------------------------------------------
// touch

TEST_F(FsTest, TouchCreatesAnEmptyFile) {
  EXPECT_EQ(fs.touch("notes.txt"), Status::Ok);
  EXPECT_EQ(List("/"), Names{"notes.txt"}); // no trailing slash: a file
  EXPECT_EQ(Cat("notes.txt"), "");
}

TEST_F(FsTest, TouchOnAnExistingFileKeepsItsContent) {
  ASSERT_EQ(fs.write("notes.txt", "keep me", false), Status::Ok);
  EXPECT_EQ(fs.touch("notes.txt"), Status::Ok);
  EXPECT_EQ(Cat("notes.txt"), "keep me");
}

TEST_F(FsTest, TouchOnAnExistingFolderLeavesItAFolder) {
  ASSERT_EQ(fs.mkdir("a"), Status::Ok);
  ASSERT_EQ(fs.touch("a/inside.txt"), Status::Ok);

  EXPECT_EQ(fs.touch("a"), Status::Ok);
  EXPECT_EQ(List("/"), Names{"a/"});
  EXPECT_EQ(List("/a"), Names{"inside.txt"});
}

TEST_F(FsTest, TouchFailures) {
  ASSERT_EQ(fs.touch("file.txt"), Status::Ok);

  EXPECT_EQ(fs.touch("nope/x"), Status::NotFound);
  EXPECT_EQ(fs.touch("file.txt/x"), Status::NotADirectory);
  EXPECT_NE(fs.touch(""), Status::Ok);
  EXPECT_EQ(fs.touch("new/"), Status::NotADirectory); // trailing slash
  EXPECT_EQ(List("/"), Names{"file.txt"});
}

TEST_F(FsTest, MkdirOverAnExistingFileFails) {
  ASSERT_EQ(fs.write("notes.txt", "hi", false), Status::Ok);
  EXPECT_EQ(fs.mkdir("notes.txt"), Status::AlreadyExists);
  EXPECT_EQ(Cat("notes.txt"), "hi");
}

// ---------------------------------------------------------------------------
// cat

TEST_F(FsTest, CatDoesNotConsumeTheFile) {
  ASSERT_EQ(fs.write("a.txt", "hello", false), Status::Ok);
  EXPECT_EQ(Cat("a.txt"), "hello");
  EXPECT_EQ(Cat("a.txt"), "hello"); // a moving cat would return "" here
}

TEST_F(FsTest, CatFailures) {
  ASSERT_EQ(fs.mkdir("dir"), Status::Ok);
  ASSERT_EQ(fs.touch("file.txt"), Status::Ok);

  EXPECT_EQ(CatStatus("dir"), Status::NotAFile);
  EXPECT_EQ(CatStatus("nope"), Status::NotFound);
  EXPECT_EQ(CatStatus(""), Status::InvalidArguments);
  EXPECT_EQ(CatStatus("file.txt/"), Status::NotFound); // trailing slash
}

TEST_F(FsTest, FailedCatLeavesOutputUntouched) {
  std::string out = "old";
  EXPECT_EQ(fs.cat("nope", out), Status::NotFound);
  EXPECT_EQ(out, "old");
}

// ---------------------------------------------------------------------------
// write

TEST_F(FsTest, WriteCreatesReplacesAndAppends) {
  EXPECT_EQ(fs.write("new.txt", "hello", false), Status::Ok);
  EXPECT_EQ(Cat("new.txt"), "hello");

  EXPECT_EQ(fs.write("new.txt", " world", true), Status::Ok);
  EXPECT_EQ(Cat("new.txt"), "hello world");

  EXPECT_EQ(fs.write("new.txt", "bye", false), Status::Ok);
  EXPECT_EQ(Cat("new.txt"), "bye");
}

TEST_F(FsTest, AppendToAMissingFileCreatesIt) {
  EXPECT_EQ(fs.write("log.txt", "x", true), Status::Ok);
  EXPECT_EQ(Cat("log.txt"), "x");
}

TEST_F(FsTest, WriteResolvesRelativePaths) {
  ASSERT_EQ(fs.mkdir("/a"), Status::Ok);
  ASSERT_EQ(fs.mkdir("/a/c"), Status::Ok);
  ASSERT_EQ(fs.mkdir("/b"), Status::Ok);
  ASSERT_EQ(fs.write("/b/log.txt", "x", false), Status::Ok);
  ASSERT_EQ(fs.cd("/a/c"), Status::Ok);

  EXPECT_EQ(fs.write("../../b/log.txt", " y", true), Status::Ok);
  EXPECT_EQ(Cat("/b/log.txt"), "x y");
}

TEST_F(FsTest, WriteFailuresChangeNothing) {
  ASSERT_EQ(fs.mkdir("dir"), Status::Ok);
  ASSERT_EQ(fs.write("file.txt", "f", false), Status::Ok);

  EXPECT_EQ(fs.write("dir", "hi", false), Status::NotAFile);
  EXPECT_EQ(fs.write("nope/f", "x", false), Status::NotFound);
  EXPECT_EQ(fs.write("file.txt/f", "x", false), Status::NotADirectory);
  EXPECT_EQ(fs.write("", "x", false), Status::InvalidArguments);
  EXPECT_EQ(fs.write("new/", "x", false), Status::NotADirectory);

  EXPECT_EQ(List("/"), (Names{"dir/", "file.txt"}));
  EXPECT_EQ(List("/dir"), Names{});
  EXPECT_EQ(Cat("file.txt"), "f");
}

// ---------------------------------------------------------------------------
// rm: tree is /p/q/f.txt, /p/w.txt, /top.txt

class RmTest : public FsTest {
protected:
  void SetUp() override {
    ASSERT_EQ(fs.mkdir("/p"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/p/q"), Status::Ok);
    ASSERT_EQ(fs.touch("/p/q/f.txt"), Status::Ok);
    ASSERT_EQ(fs.write("/p/w.txt", "hi", false), Status::Ok);
    ASSERT_EQ(fs.touch("/top.txt"), Status::Ok);
  }
};

TEST_F(RmTest, RemovesAFile) {
  EXPECT_EQ(fs.rm("top.txt", false), Status::Ok);
  EXPECT_EQ(List("/"), Names{"p/"});
  EXPECT_EQ(CatStatus("/top.txt"), Status::NotFound);
}

TEST_F(RmTest, RemovesRelativeToTheCurrentFolder) {
  ASSERT_EQ(fs.cd("/p/q"), Status::Ok);
  EXPECT_EQ(fs.rm("f.txt", false), Status::Ok);
  EXPECT_EQ(List("."), Names{});
}

TEST_F(RmTest, RecursiveRemovesTheWholeSubtree) {
  EXPECT_EQ(fs.rm("p", true), Status::Ok);
  EXPECT_EQ(List("/"), Names{"top.txt"});
  EXPECT_EQ(CatStatus("/p/w.txt"), Status::NotFound);
  EXPECT_EQ(LsStatus("/p/q"), Status::NotFound);

  // a folder re-created with the same name starts empty
  ASSERT_EQ(fs.mkdir("p"), Status::Ok);
  EXPECT_EQ(List("p"), Names{});
}

TEST_F(RmTest, RecursiveRemovesAnEmptyFolder) {
  ASSERT_EQ(fs.mkdir("/empty"), Status::Ok);
  EXPECT_EQ(fs.rm("/empty", true), Status::Ok);
  EXPECT_EQ(List("/"), (Names{"p/", "top.txt"}));
}

TEST_F(RmTest, FolderWithoutRecursiveIsRefused) {
  EXPECT_EQ(fs.rm("p", false), Status::NotAFile);
  EXPECT_EQ(fs.rm("p/q", false), Status::NotAFile);
  EXPECT_EQ(List("/p"), (Names{"q/", "w.txt"}));
  EXPECT_EQ(List("/p/q"), Names{"f.txt"});
}

TEST_F(RmTest, RmFailures) {
  EXPECT_EQ(fs.rm("nope", false), Status::NotFound);
  EXPECT_EQ(fs.rm("", false), Status::InvalidArguments);
  EXPECT_EQ(fs.rm("top.txt/", false), Status::NotFound); // trailing slash
  EXPECT_EQ(List("/"), (Names{"p/", "top.txt"}));
}

TEST_F(RmTest, RootCannotBeRemovedHoweverItIsSpelled) {
  EXPECT_EQ(fs.rm("/", true), Status::PermissionDenied);
  EXPECT_EQ(fs.rm("//..", true), Status::PermissionDenied);
  EXPECT_EQ(List("/"), (Names{"p/", "top.txt"}));
}

TEST_F(RmTest, CurrentFolderAndItsAncestorsCannotBeRemoved) {
  // Deleting any of these would leave currDirectory_ dangling.
  ASSERT_EQ(fs.cd("/p/q"), Status::Ok);
  EXPECT_EQ(fs.rm(".", true), Status::PermissionDenied);
  EXPECT_EQ(fs.rm("..", true), Status::PermissionDenied);
  EXPECT_EQ(fs.rm("/p", true), Status::PermissionDenied);

  EXPECT_EQ(fs.pwd(), "/p/q");
  EXPECT_EQ(List("."), Names{"f.txt"});
}

// ---------------------------------------------------------------------------
// mv: tree is /a/sub, /a/x.txt "x", /b/x.txt "bx", /c

class MvTest : public FsTest {
protected:
  void SetUp() override {
    ASSERT_EQ(fs.mkdir("/a"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/a/sub"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/b"), Status::Ok);
    ASSERT_EQ(fs.mkdir("/c"), Status::Ok);
    ASSERT_EQ(fs.write("/a/x.txt", "x", false), Status::Ok);
    ASSERT_EQ(fs.write("/b/x.txt", "bx", false), Status::Ok);
  }
};

TEST_F(MvTest, RenamesAFile) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/a/y.txt"), Status::Ok);
  EXPECT_EQ(List("/a"), (Names{"sub/", "y.txt"}));
  EXPECT_EQ(Cat("/a/y.txt"), "x");
}

TEST_F(MvTest, MovesAFileIntoAFolder) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/c"), Status::Ok);
  EXPECT_EQ(List("/a"), Names{"sub/"});
  EXPECT_EQ(List("/c"), Names{"x.txt"});
  EXPECT_EQ(Cat("/c/x.txt"), "x");
}

TEST_F(MvTest, MovesAndRenamesInOneStep) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/c/renamed.txt"), Status::Ok);
  EXPECT_EQ(List("/c"), Names{"renamed.txt"});
  EXPECT_EQ(Cat("/c/renamed.txt"), "x");
}

TEST_F(MvTest, FileOntoFileOverwritesWhenMovingIntoAFolder) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/b"), Status::Ok);
  EXPECT_EQ(Cat("/b/x.txt"), "x");
  EXPECT_EQ(List("/a"), Names{"sub/"});
}

TEST_F(MvTest, FileOntoFileOverwritesWhenRenaming) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/b/x.txt"), Status::Ok);
  EXPECT_EQ(Cat("/b/x.txt"), "x");
  EXPECT_EQ(List("/b"), Names{"x.txt"});
  EXPECT_EQ(List("/a"), Names{"sub/"});
}

TEST_F(MvTest, MovingAFileOntoItselfIsANoOp) {
  // These all target the file's own slot; an erase-then-move would free it.
  EXPECT_EQ(fs.mv("/a/x.txt", "/a/x.txt"), Status::Ok);
  EXPECT_EQ(fs.mv("/a/x.txt", "/a"), Status::Ok);
  EXPECT_EQ(fs.mv("/a/x.txt", "/a/./x.txt"), Status::Ok);
  EXPECT_EQ(Cat("/a/x.txt"), "x");
  EXPECT_EQ(List("/a"), (Names{"sub/", "x.txt"}));
}

TEST_F(MvTest, FileOntoAFolderOfTheSameNameIsRefused) {
  ASSERT_EQ(fs.mkdir("/c/x.txt"), Status::Ok); // a FOLDER named x.txt
  ASSERT_EQ(fs.touch("/c/x.txt/inside"), Status::Ok);

  EXPECT_EQ(fs.mv("/a/x.txt", "/c"), Status::AlreadyExists);
  EXPECT_EQ(Cat("/a/x.txt"), "x");
  EXPECT_EQ(List("/c/x.txt"), Names{"inside"});
}

TEST_F(MvTest, FolderOntoAFileOfTheSameNameIsRefused) {
  ASSERT_EQ(fs.mkdir("/c/x.txt"), Status::Ok);
  ASSERT_EQ(fs.touch("/c/x.txt/inside"), Status::Ok);

  EXPECT_EQ(fs.mv("/c/x.txt", "/b"), Status::AlreadyExists);
  EXPECT_EQ(Cat("/b/x.txt"), "bx");
  EXPECT_EQ(List("/c/x.txt"), Names{"inside"});
}

TEST_F(MvTest, FolderOntoAFolderOfTheSameNameIsRefused) {
  ASSERT_EQ(fs.mkdir("/c/sub"), Status::Ok);
  ASSERT_EQ(fs.touch("/c/sub/keep"), Status::Ok);
  ASSERT_EQ(fs.touch("/a/sub/mine"), Status::Ok);

  EXPECT_EQ(fs.mv("/a/sub", "/c"), Status::AlreadyExists);
  EXPECT_EQ(List("/c/sub"), Names{"keep"});
  EXPECT_EQ(List("/a/sub"), Names{"mine"});
}

TEST_F(MvTest, MovesAFolderWithEverythingInIt) {
  ASSERT_EQ(fs.write("/a/sub/deep.txt", "d", false), Status::Ok);

  EXPECT_EQ(fs.mv("/a", "/c"), Status::Ok);
  EXPECT_EQ(List("/"), (Names{"b/", "c/"}));
  EXPECT_EQ(List("/c/a"), (Names{"sub/", "x.txt"}));
  EXPECT_EQ(Cat("/c/a/sub/deep.txt"), "d");
}

TEST_F(MvTest, RenamesAFolder) {
  EXPECT_EQ(fs.mv("/a", "/arch"), Status::Ok);
  EXPECT_EQ(List("/"), (Names{"arch/", "b/", "c/"}));
  EXPECT_EQ(List("/arch"), (Names{"sub/", "x.txt"}));
}

TEST_F(MvTest, MovedFolderReportsItsNewPath) {
  // Its parent pointer must follow it, or pwd and .. would use the old place.
  ASSERT_EQ(fs.mv("/a/sub", "/c"), Status::Ok);
  ASSERT_EQ(fs.cd("/c/sub"), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/c/sub");
  ASSERT_EQ(fs.cd(".."), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/c");
}

TEST_F(MvTest, MovingTheFolderYouAreInIsSafe) {
  // The node keeps its address, so currDirectory_ stays valid.
  ASSERT_EQ(fs.cd("/a/sub"), Status::Ok);
  EXPECT_EQ(fs.mv("/a", "/b"), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/b/a/sub");
  ASSERT_EQ(fs.cd(".."), Status::Ok);
  EXPECT_EQ(fs.pwd(), "/b/a");
}

TEST_F(MvTest, CannotMoveAFolderIntoItself) {
  EXPECT_EQ(fs.mv("/a", "/a"), Status::PermissionDenied);
  EXPECT_EQ(fs.mv("/a", "/a/sub"), Status::PermissionDenied);
  EXPECT_EQ(List("/"), (Names{"a/", "b/", "c/"}));
  EXPECT_EQ(List("/a"), (Names{"sub/", "x.txt"}));
}

TEST_F(MvTest, MvFailures) {
  EXPECT_EQ(fs.mv("/", "/b"), Status::PermissionDenied);
  EXPECT_EQ(fs.mv("nope", "/b"), Status::NotFound);
  EXPECT_EQ(fs.mv("", "/b"), Status::InvalidArguments);
  EXPECT_EQ(fs.mv("/a/x.txt", ""), Status::InvalidArguments);
  EXPECT_EQ(fs.mv("/a/x.txt", "/nope/x.txt"), Status::NotFound);
  EXPECT_EQ(fs.mv("/a/x.txt", "/b/x.txt/inside"), Status::NotADirectory);
  EXPECT_EQ(Cat("/a/x.txt"), "x");
  EXPECT_EQ(Cat("/b/x.txt"), "bx");
}

TEST_F(MvTest, TrailingSlashDestinationMustBeAnExistingFolder) {
  EXPECT_EQ(fs.mv("/a/x.txt", "/newdir/"), Status::NotADirectory);
  EXPECT_EQ(Cat("/a/x.txt"), "x");
  EXPECT_EQ(LsStatus("/newdir"), Status::NotFound);

  EXPECT_EQ(fs.mv("/a/x.txt", "/c/"), Status::Ok);
  EXPECT_EQ(Cat("/c/x.txt"), "x");
}

// ---------------------------------------------------------------------------
// Limits from config.h

class GuardTest : public FsTest {
protected:
  static constexpr std::size_t kMaxName = Config::MAX_FILENAME_LENGTH;
  static constexpr std::size_t kMaxDepth = Config::MAX_DIRECTORY_DEPTH;
  static constexpr std::size_t kMaxSize = Config::MAX_FILE_SIZE_BYTES;

  // "/d/d/.../d" with `levels` pieces
  static std::string Chain(std::size_t levels) {
    std::string path;
    for (std::size_t i = 0; i < levels; i++) {
      path += "/d";
    }
    return path;
  }

  // mkdir every level of Chain(levels)
  void BuildChain(std::size_t levels) {
    for (std::size_t i = 1; i <= levels; i++) {
      ASSERT_EQ(fs.mkdir(Chain(i)), Status::Ok) << "level " << i;
    }
  }
};

TEST_F(GuardTest, NameLengthLimit) {
  EXPECT_EQ(fs.mkdir(std::string(kMaxName, 'n')), Status::Ok);
  EXPECT_EQ(fs.mkdir(std::string(kMaxName + 1, 'm')), Status::InvalidName);
  EXPECT_EQ(fs.touch(std::string(kMaxName + 1, 't')), Status::InvalidName);
  EXPECT_EQ(List("/"), Names{std::string(kMaxName, 'n') + "/"});
}

TEST_F(GuardTest, CreatingIsAllowedExactlyDownToTheDepthLimit) {
  BuildChain(kMaxDepth);
  ASSERT_EQ(fs.cd(Chain(kMaxDepth)), Status::Ok);
  EXPECT_EQ(fs.pwd(), Chain(kMaxDepth));
}

TEST_F(GuardTest, CreatingPastTheDepthLimitIsRefused) {
  BuildChain(kMaxDepth);
  const std::string deepest = Chain(kMaxDepth);

  EXPECT_EQ(fs.mkdir(deepest + "/d"), Status::MaxDepthReached);
  EXPECT_EQ(fs.touch(deepest + "/f"), Status::MaxDepthReached);
  EXPECT_EQ(fs.write(deepest + "/f", "x", false), Status::MaxDepthReached);
  EXPECT_EQ(List(deepest), Names{});
}

TEST_F(GuardTest, MvCountsTheHeightOfTheMovedSubtree) {
  BuildChain(kMaxDepth);
  ASSERT_EQ(fs.mkdir("/e"), Status::Ok);
  ASSERT_EQ(fs.mkdir("/e/e"), Status::Ok); // /e is 2 levels tall

  // Two levels into the deepest folder would end 2 past the limit.
  EXPECT_EQ(fs.mv("/e", Chain(kMaxDepth)), Status::MaxDepthReached);
  // One level too deep is still too deep.
  EXPECT_EQ(fs.mv("/e", Chain(kMaxDepth - 1)), Status::MaxDepthReached);
  EXPECT_EQ(List("/e"), Names{"e/"});

  // Two levels higher it fits exactly.
  EXPECT_EQ(fs.mv("/e", Chain(kMaxDepth - 2)), Status::Ok);
  EXPECT_EQ(List(Chain(kMaxDepth - 2) + "/e"), Names{"e/"});
}

TEST_F(GuardTest, MvAFileIntoTheDeepestFolderIsRefused) {
  BuildChain(kMaxDepth);
  ASSERT_EQ(fs.touch("/f.txt"), Status::Ok);
  EXPECT_EQ(fs.mv("/f.txt", Chain(kMaxDepth)), Status::MaxDepthReached);
  EXPECT_EQ(Cat("/f.txt"), "");
}

TEST_F(GuardTest, FileSizeLimitOnReplace) {
  EXPECT_EQ(fs.write("big.txt", std::string(kMaxSize, 'x'), false), Status::Ok);
  EXPECT_EQ(fs.write("big.txt", std::string(kMaxSize + 1, 'y'), false),
            Status::MaxFileSizeReached);
  EXPECT_EQ(Cat("big.txt"), std::string(kMaxSize, 'x'));
}

TEST_F(GuardTest, FileSizeLimitOnAppend) {
  ASSERT_EQ(fs.write("big.txt", "a", false), Status::Ok);
  EXPECT_EQ(fs.write("big.txt", std::string(kMaxSize - 1, 'b'), true),
            Status::Ok);
  EXPECT_EQ(fs.write("big.txt", "c", true), Status::MaxFileSizeReached);
  EXPECT_EQ(Cat("big.txt"), "a" + std::string(kMaxSize - 1, 'b'));
}

TEST_F(GuardTest, OversizedWriteDoesNotCreateTheFile) {
  EXPECT_EQ(fs.write("big.txt", std::string(kMaxSize + 1, 'x'), false),
            Status::MaxFileSizeReached);
  EXPECT_EQ(List("/"), Names{});
}

// ---------------------------------------------------------------------------
// Node destructor

TEST(NodeDestructor, DeepChainDoesNotOverflowTheStack) {
  // There is deliberately no assertion here: this test's job is to not crash.
  // A recursive destructor overflows the stack on a chain this deep (verified
  // by swapping in a plain recursive ~Node), which kills the test binary.
  // The chain is built by hand because mkdir enforces MAX_DIRECTORY_DEPTH.
  constexpr int kLevels = 200000;
  auto root = std::make_unique<Node>(true, "");
  Node *curr = root.get();
  for (int i = 0; i < kLevels; i++) {
    auto child = std::make_unique<Node>(true, "d");
    child->parent = curr;
    Node *next = child.get();
    curr->children.emplace("d", std::move(child));
    curr = next;
  }
  root.reset();
}
