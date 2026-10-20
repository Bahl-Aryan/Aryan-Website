// GoogleTest suite for the shell's line parsing (src/shell.h).
// AI generated
//
// Same conventions as test_fs.cpp: expected values written out literally,
// and failures checked for leaving their outputs untouched.

#include <gtest/gtest.h>

#include <ostream>
#include <string>
#include <vector>

#include "config.h"
#include "shell.h"
#include "test_helpers.h"

using Words = std::vector<std::string>;

// ---------------------------------------------------------------------------
// splitWords

TEST(SplitWords, SplitsOnSpaces) {
  EXPECT_EQ(Shell::splitWords("ls /a"), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords("mv a.txt b.txt"), (Words{"mv", "a.txt", "b.txt"}));
}

TEST(SplitWords, CollapsesRunsOfSpacesAndTabs) {
  EXPECT_EQ(Shell::splitWords("  ls    /a  "), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords("\tls\t\t/a\t"), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords(" \t ls \t /a"), (Words{"ls", "/a"}));
}

TEST(SplitWords, EmptyAndBlankLinesHaveNoWords) {
  EXPECT_EQ(Shell::splitWords(""), Words{});
  EXPECT_EQ(Shell::splitWords("   "), Words{});
  EXPECT_EQ(Shell::splitWords("\t \t"), Words{});
}

TEST(SplitWords, KeepsPathsFlagsAndDotsInsideWords) {
  EXPECT_EQ(Shell::splitWords("rm -r ./a/../b/"), (Words{"rm", "-r", "./a/../b/"}));
  EXPECT_EQ(Shell::splitWords("cd .."), (Words{"cd", ".."}));
}

TEST(SplitWords, RedirectIsItsOwnWordWithOrWithoutSpaces) {
  EXPECT_EQ(Shell::splitWords("echo hi > a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi>a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi >a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi> a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
}

TEST(SplitWords, AppendIsOneWordWithOrWithoutSpaces) {
  EXPECT_EQ(Shell::splitWords("echo hi >> a.txt"), (Words{"echo", "hi", ">>", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi>>a.txt"), (Words{"echo", "hi", ">>", "a.txt"}));
}

TEST(SplitWords, RunsOfArrowsSplitIntoPairsLeftToRight) {
  // "maximal munch": each > takes the next > if it can
  EXPECT_EQ(Shell::splitWords(">>>"), (Words{">>", ">"}));
  EXPECT_EQ(Shell::splitWords(">>>>>"), (Words{">>", ">>", ">"}));
  EXPECT_EQ(Shell::splitWords(">>>>>>"), (Words{">>", ">>", ">>"}));
  EXPECT_EQ(Shell::splitWords("> >"), (Words{">", ">"}));
}

TEST(SplitWords, ArrowAtTheEndOfTheLine) {
  // reading past the end here would be caught by ASan
  EXPECT_EQ(Shell::splitWords("echo hi >"), (Words{"echo", "hi", ">"}));
  EXPECT_EQ(Shell::splitWords("echo hi>"), (Words{"echo", "hi", ">"}));
  EXPECT_EQ(Shell::splitWords(">"), Words{">"});
}

TEST(SplitWords, WordAfterAnArrowStartsFresh) {
  // the word before the arrow must not leak into the word after it
  EXPECT_EQ(Shell::splitWords("abc>def"), (Words{"abc", ">", "def"}));
  EXPECT_EQ(Shell::splitWords("abc>>def>ghi"), (Words{"abc", ">>", "def", ">", "ghi"}));
}

TEST(SplitWords, QuotesAreNotSpecial) {
  // quotes aren't supported: they stay part of the word
  EXPECT_EQ(Shell::splitWords("echo \"hello world\""),
            (Words{"echo", "\"hello", "world\""}));
}

// ---------------------------------------------------------------------------
// parseCommand: valid lines

TEST(ParseCommand, PlainCommandHasNoRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("ls /a", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, (Words{"ls", "/a"}));
  EXPECT_FALSE(cmd.redirectExists);
}

TEST(ParseCommand, ReplaceRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("echo hello world > notes.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, (Words{"echo", "hello", "world"}));
  EXPECT_TRUE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "notes.txt");
  EXPECT_FALSE(cmd.shouldAppend);
}

TEST(ParseCommand, AppendRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("pwd >> log.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"pwd"});
  EXPECT_TRUE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "log.txt");
  EXPECT_TRUE(cmd.shouldAppend);
}

TEST(ParseCommand, RedirectWithoutSpaces) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("pwd>>log.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"pwd"});
  EXPECT_EQ(cmd.redirectTarget, "log.txt");
  EXPECT_TRUE(cmd.shouldAppend);
}

TEST(ParseCommand, RedirectTargetCanBeAPath) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("ls > /a/b/out.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.redirectTarget, "/a/b/out.txt");
}

TEST(ParseCommand, EmptyAndBlankLinesParseToNothingToRun) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{});
  EXPECT_FALSE(cmd.redirectExists);

  EXPECT_EQ(Shell::parseCommand(" \t ", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{});
  EXPECT_FALSE(cmd.redirectExists);
}

TEST(ParseCommand, SuccessReplacesEverythingInOut) {
  // leftovers from an earlier parse must not survive
  ParsedCommand cmd;
  ASSERT_EQ(Shell::parseCommand("echo a >> old.txt", cmd), Status::Ok);

  EXPECT_EQ(Shell::parseCommand("ls", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"ls"});
  EXPECT_FALSE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "");
  EXPECT_FALSE(cmd.shouldAppend);
}

// ---------------------------------------------------------------------------
// parseCommand: syntax errors (table-driven)

class ParseCommandError : public ::testing::TestWithParam<std::string> {};

TEST_P(ParseCommandError, IsRejectedAndLeavesOutUntouched) {
  ParsedCommand cmd;
  cmd.words = {"untouched"};
  cmd.redirectTarget = "untouched";

  EXPECT_EQ(Shell::parseCommand(GetParam(), cmd), Status::InvalidArguments);
  EXPECT_EQ(cmd.words, Words{"untouched"});
  EXPECT_EQ(cmd.redirectTarget, "untouched");
  EXPECT_FALSE(cmd.redirectExists);
}

INSTANTIATE_TEST_SUITE_P(
    SyntaxErrors, ParseCommandError,
    ::testing::Values(
        "> a.txt",            // no command before the operator
        ">> a.txt",           // no command before the operator
        ">",                  // nothing at all around it
        "echo hi >",          // no target
        "echo hi >>",         // no target
        "echo hi > a b",      // extra word after the target
        "echo hi > a.txt b",  // extra word after the target
        "echo hi > >> a",     // target is another operator
        "echo hi > >",        // target is another operator
        "echo a > b > c",     // two redirects
        "echo a > b >> c",    // two redirects
        ">>>>>>",             // only operators
        "echo hi >> >> >>",   // operators after the command
        "echo hi >>> a"));    // >> then > : two operators

// ---------------------------------------------------------------------------
// Shell::execute: whole command lines in, exact output text out.
// Each test gets a fresh Shell (and so a fresh FileSystem).

class ShellTest : public ::testing::Test {
protected:
  Shell shell;

  std::string Run(const std::string &line) { return shell.execute(line); }
};

TEST_F(ShellTest, PromptShowsTheCurrentFolder) {
  EXPECT_EQ(shell.prompt(), "aryanOS:/ $ ");
  ASSERT_EQ(Run("mkdir a"), "");
  ASSERT_EQ(Run("cd a"), "");
  EXPECT_EQ(shell.prompt(), "aryanOS:/a $ ");
}

TEST_F(ShellTest, BlankLinesPrintNothing) {
  EXPECT_EQ(Run(""), "");
  EXPECT_EQ(Run("   "), "");
  EXPECT_EQ(Run("\t"), "");
  EXPECT_FALSE(shell.shouldExit());
}

TEST_F(ShellTest, UnknownCommand) {
  EXPECT_EQ(Run("foo"), "kernel: foo: command not found\n");
  EXPECT_EQ(Run("foo bar baz"), "kernel: foo: command not found\n");
}

TEST_F(ShellTest, SyntaxErrorRunsNothing) {
  EXPECT_EQ(Run("echo hi >"), "kernel: syntax error\n");
  EXPECT_EQ(Run("echo a > b.txt > c.txt"), "kernel: syntax error\n");
  EXPECT_EQ(Run("> a.txt"), "kernel: syntax error\n");
  EXPECT_EQ(Run("ls"), "");  // none of the targets were created
}

TEST_F(ShellTest, ExitSetsShouldExit) {
  EXPECT_FALSE(shell.shouldExit());
  EXPECT_EQ(Run("exit"), "");
  EXPECT_TRUE(shell.shouldExit());
}

TEST_F(ShellTest, ExitIgnoresSurroundingWhitespace) {
  EXPECT_EQ(Run("   exit  "), "");
  EXPECT_TRUE(shell.shouldExit());
}

TEST_F(ShellTest, OtherCommandsDoNotRequestExit) {
  Run("pwd");
  Run("foo");
  Run("echo hi >");
  EXPECT_FALSE(shell.shouldExit());
}

// pwd / cd

TEST_F(ShellTest, PwdPrintsTheCurrentFolder) {
  EXPECT_EQ(Run("pwd"), "/\n");
}

TEST_F(ShellTest, CdChangesFolderAndStateCarriesOver) {
  ASSERT_EQ(Run("mkdir a"), "");
  ASSERT_EQ(Run("mkdir a/b"), "");
  EXPECT_EQ(Run("cd a/b"), "");
  EXPECT_EQ(Run("pwd"), "/a/b\n");
  EXPECT_EQ(Run("cd .."), "");
  EXPECT_EQ(Run("pwd"), "/a\n");
}

TEST_F(ShellTest, CdErrors) {
  ASSERT_EQ(Run("touch f.txt"), "");
  EXPECT_EQ(Run("cd nope"), "cd: No such file or directory\n");
  EXPECT_EQ(Run("cd f.txt"), "cd: Not a directory\n");
  EXPECT_EQ(Run("cd"), "cd: usage: cd <path>\n");
  EXPECT_EQ(Run("cd a b"), "cd: usage: cd <path>\n");
  EXPECT_EQ(Run("pwd"), "/\n");
}

// ls / mkdir

TEST_F(ShellTest, LsPrintsOneNamePerLine) {
  EXPECT_EQ(Run("ls"), "");  // empty folder: no blank line
  ASSERT_EQ(Run("mkdir b"), "");
  ASSERT_EQ(Run("mkdir a"), "");
  ASSERT_EQ(Run("touch c.txt"), "");
  EXPECT_EQ(Run("ls"), "a/\nb/\nc.txt\n");
  EXPECT_EQ(Run("ls /"), "a/\nb/\nc.txt\n");
  EXPECT_EQ(Run("ls a"), "");
  EXPECT_EQ(Run("ls c.txt"), "c.txt\n");
}

TEST_F(ShellTest, LsErrors) {
  EXPECT_EQ(Run("ls nope"), "ls: No such file or directory\n");
  EXPECT_EQ(Run("ls a b"), "ls: usage: ls [path]\n");
}

TEST_F(ShellTest, MkdirOutputAndErrors) {
  EXPECT_EQ(Run("mkdir a"), "");
  EXPECT_EQ(Run("mkdir a"), "mkdir: Object already exists\n");
  EXPECT_EQ(Run("mkdir nope/x"), "mkdir: No such file or directory\n");
  EXPECT_EQ(Run("mkdir"), "mkdir: usage: mkdir <path>\n");
  EXPECT_EQ(Run("mkdir x y"), "mkdir: usage: mkdir <path>\n");
  EXPECT_EQ(Run("ls"), "a/\n");
}

// echo

TEST_F(ShellTest, EchoJoinsWordsWithSingleSpaces) {
  EXPECT_EQ(Run("echo hi"), "hi\n");
  EXPECT_EQ(Run("echo hello world"), "hello world\n");
  EXPECT_EQ(Run("echo   a    b   "), "a b\n");  // no trailing space
  EXPECT_EQ(Run("echo"), "\n");
}

// touch / cat

TEST_F(ShellTest, TouchAndCat) {
  EXPECT_EQ(Run("touch f.txt"), "");
  EXPECT_EQ(Run("cat f.txt"), "");
  EXPECT_EQ(Run("touch"), "touch: usage: touch <path>\n");
}

TEST_F(ShellTest, CatErrors) {
  ASSERT_EQ(Run("mkdir d"), "");
  EXPECT_EQ(Run("cat nope"), "cat: No such file or directory\n");
  EXPECT_EQ(Run("cat d"), "cat: Is a directory\n");
  EXPECT_EQ(Run("cat"), "cat: usage: cat <path>\n");
  EXPECT_EQ(Run("cat a b"), "cat: usage: cat <path>\n");
}

// redirects

TEST_F(ShellTest, RedirectWritesOutputToAFileInsteadOfPrinting) {
  EXPECT_EQ(Run("echo hello world > notes.txt"), "");
  EXPECT_EQ(Run("cat notes.txt"), "hello world\n");
}

TEST_F(ShellTest, RedirectWithoutSpaces) {
  EXPECT_EQ(Run("echo hi>a.txt"), "");
  EXPECT_EQ(Run("echo there>>a.txt"), "");
  EXPECT_EQ(Run("cat a.txt"), "hi\nthere\n");
}

TEST_F(ShellTest, ReplaceOverwritesAndAppendAddsLines) {
  ASSERT_EQ(Run("echo one > log.txt"), "");
  ASSERT_EQ(Run("echo two >> log.txt"), "");
  ASSERT_EQ(Run("echo three >> log.txt"), "");
  EXPECT_EQ(Run("cat log.txt"), "one\ntwo\nthree\n");

  ASSERT_EQ(Run("echo fresh > log.txt"), "");
  EXPECT_EQ(Run("cat log.txt"), "fresh\n");
}

TEST_F(ShellTest, RedirectWorksForAnyCommand) {
  ASSERT_EQ(Run("mkdir a"), "");
  ASSERT_EQ(Run("mkdir b"), "");

  EXPECT_EQ(Run("pwd > p.txt"), "");
  EXPECT_EQ(Run("cat p.txt"), "/\n");

  // ls runs before its output is written, so l.txt isn't in its own listing
  EXPECT_EQ(Run("ls > l.txt"), "");
  EXPECT_EQ(Run("cat l.txt"), "a/\nb/\np.txt\n");

  // cat + redirect copies a file
  EXPECT_EQ(Run("cat p.txt > copy.txt"), "");
  EXPECT_EQ(Run("cat copy.txt"), "/\n");
}

TEST_F(ShellTest, RedirectTargetIsResolvedFromTheCurrentFolder) {
  ASSERT_EQ(Run("mkdir a"), "");
  ASSERT_EQ(Run("cd a"), "");
  EXPECT_EQ(Run("echo x > ../top.txt"), "");
  EXPECT_EQ(Run("echo y > here.txt"), "");
  EXPECT_EQ(Run("cat /top.txt"), "x\n");
  EXPECT_EQ(Run("cat /a/here.txt"), "y\n");
}

TEST_F(ShellTest, FailedCommandLeavesTheRedirectTargetAlone) {
  ASSERT_EQ(Run("echo old > t.txt"), "");
  EXPECT_EQ(Run("cat nope > t.txt"), "cat: No such file or directory\n");
  EXPECT_EQ(Run("cat t.txt"), "old\n");

  EXPECT_EQ(Run("ls nope > new.txt"), "ls: No such file or directory\n");
  EXPECT_EQ(Run("ls"), "t.txt\n");  // new.txt was never created
}

TEST_F(ShellTest, BadRedirectTargetReportsTheTarget) {
  ASSERT_EQ(Run("mkdir d"), "");
  EXPECT_EQ(Run("echo hi > d"), "kernel: d: Is a directory\n");
  EXPECT_EQ(Run("echo hi > nope/x.txt"), "kernel: nope/x.txt: No such file or directory\n");
  EXPECT_EQ(Run("ls"), "d/\n");
}

TEST_F(ShellTest, RedirectRespectsTheFileSizeLimit) {
  const std::string big(Config::MAX_FILE_SIZE_BYTES + 1, 'x');
  EXPECT_EQ(Run("echo " + big + " > big.txt"), "kernel: big.txt: File too large\n");
  EXPECT_EQ(Run("ls"), "");
}

// rm / mv

TEST_F(ShellTest, RmFilesAndFolders) {
  ASSERT_EQ(Run("touch f.txt"), "");
  ASSERT_EQ(Run("mkdir d"), "");
  ASSERT_EQ(Run("touch d/inside.txt"), "");
  ASSERT_EQ(Run("mkdir e"), "");

  EXPECT_EQ(Run("rm f.txt"), "");
  EXPECT_EQ(Run("rm d"), "rm: Is a directory\n");
  EXPECT_EQ(Run("rm -r d"), "");
  EXPECT_EQ(Run("rm e -r"), "");  // flag after the path also works
  EXPECT_EQ(Run("ls"), "");
}

TEST_F(ShellTest, RmErrors) {
  ASSERT_EQ(Run("touch a.txt"), "");
  EXPECT_EQ(Run("rm nope"), "rm: No such file or directory\n");
  EXPECT_EQ(Run("rm"), "rm: usage: rm [-r] <path>\n");
  EXPECT_EQ(Run("rm -r"), "rm: No such file or directory\n");
  EXPECT_EQ(Run("rm -f a.txt"), "rm: usage: rm [-r] <path>\n");
  EXPECT_EQ(Run("rm a.txt b.txt"), "rm: usage: rm [-r] <path>\n");
  EXPECT_EQ(Run("rm /"), "rm: Permission denied\n");  // root check comes first
  EXPECT_EQ(Run("rm -r /"), "rm: Permission denied\n");
  EXPECT_EQ(Run("ls"), "a.txt\n");
}

TEST_F(ShellTest, MvRenamesAndMoves) {
  ASSERT_EQ(Run("echo data > x.txt"), "");
  ASSERT_EQ(Run("mkdir m"), "");

  EXPECT_EQ(Run("mv x.txt y.txt"), "");
  EXPECT_EQ(Run("mv y.txt m"), "");
  EXPECT_EQ(Run("ls"), "m/\n");
  EXPECT_EQ(Run("cat m/y.txt"), "data\n");
}

TEST_F(ShellTest, MvErrors) {
  EXPECT_EQ(Run("mv"), "mv: usage: mv <source> <dest>\n");
  EXPECT_EQ(Run("mv a"), "mv: usage: mv <source> <dest>\n");
  EXPECT_EQ(Run("mv a b c"), "mv: usage: mv <source> <dest>\n");
  EXPECT_EQ(Run("mv nope x"), "mv: No such file or directory\n");
}

// help

TEST_F(ShellTest, HelpListsEveryCommandAlphabeticallyPlusExit) {
  EXPECT_EQ(Run("help"),
            "cat <path>\n"
            "cd <path>\n"
            "echo [text...]\n"
            "help\n"
            "ls [path]\n"
            "mkdir <path>\n"
            "mv <source> <dest>\n"
            "pwd\n"
            "rm [-r] <path>\n"
            "touch <path>\n"
            "exit\n");
}
