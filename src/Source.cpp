#include <iostream>
#include <string>
#include <string_view>
#include <filesystem>
#include <fstream>
#include <chrono>
#include <future>
#include <boost/process.hpp>
//include necessary include files.

namespace fs = std::filesystem;
namespace ch = std::chrono;
namespace bp = boost::process;
using namespace std::chrono_literals;

//commandline arguments = 1->problem id(ex:00) 2->user 3->limited time 4->codename
int main(int argc, char** argv) {

  if (argc <= 1) {
	std::cerr << "コマンドライン引数を入力してください。" << std::endl;
	return 0;
  }

  {
	std::string tmpPath = "../users/";
	tmpPath += std::string(argv[2]);
	tmpPath += "/submission";
	fs::current_path(tmpPath);
  }
  //Move to user directory.

  std::string compileCmd = "g++ -o ";
  compileCmd += std::string(argv[4]);
  compileCmd += " ";
  compileCmd += std::string(argv[4]);
  compileCmd += ".cpp";
  //Make compile command.

  int endCode = system(compileCmd.c_str());//Compile submitted code.

  if (endCode != 0) {
	std::cout << 4;//CE
	return 0;
  }
  //If compile error happens,output 4 and terminate this program.

  std::string testcasePath = "../../../problem/";
  testcasePath += std::string(argv[1]);
  //Make testcase directory path.


  std::string program = "";
  program += std::string(argv[4]);
  program += ".exe";
  //execute file's name.

  for (const fs::directory_entry& x : fs::directory_iterator(testcasePath + "/in")) {//Search all sample testcase files.



	fs::path in = x.path();
	bp::ipstream out;
	//Set sub process' input and output.


	int res = -1;
	bp::child sub(program, bp::std_in < in, bp::std_out > out, bp::std_err > bp::null);
	//Make a sub process.


	if (!sub.valid()) {
	  res = 5;//IE
	}
	else {

	  try {
		if (sub.wait_for(ch::milliseconds(std::stoi(argv[3])))) {

		  std::string outTestcasePath = testcasePath;
		  outTestcasePath += "/out/";
		  outTestcasePath += x.path().filename().string();
		  std::ifstream ans(outTestcasePath);
		  //Get answer input.
		  std::string a, o;
		  res = 0;//AC
		  while (std::getline(ans, a) && std::getline(out, o)) {
			boost::trim(a);
			boost::trim(o);
			if (a != o) {
			  res = 1;//WA
			  //break;
			}

		  }

		  //Judge whether submitted program is AC or WA.
		  if (sub.exit_code() != 0)res = 3;//RE

		}
		else {

		  res = 2;//TLE	
		  sub.terminate();

		}
	  }
	  catch (std::exception & e) {
		res = 3;//RE
	  }

	}

	std::cout << res << std::flush;

  }

  return 0;
}
