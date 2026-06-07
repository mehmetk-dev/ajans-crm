#!/bin/bash
JAR=/root/.m2/repository/org/springframework/security/spring-security-crypto/6.4.3/spring-security-crypto-6.4.3.jar:/root/.m2/repository/commons-logging/commons-logging/1.2/commons-logging-1.2.jar
cat > /tmp/H.java << 'JAVAEOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class H {
  public static void main(String[] a) {
    BCryptPasswordEncoder e = new BCryptPasswordEncoder(10);
    String[] p = {"enes.2026","hakan.2026","mehmet.2026","burcu.2026","suleyman.2026","ebru.2026","rasit.2026","alican.2026","merve.2026","gozde.2026","fikret.2026","ismail.2026","mehri.2026","anastasia.2026","omer.2026"};
    for(String x:p) System.out.println(x+"="+e.encode(x));
  }
}
JAVAEOF
javac -cp $JAR /tmp/H.java -d /tmp && java -cp /tmp:$JAR H
